"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrg, requireRole } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const MemberSchema = z.object({
  businessName: z.string().min(1, "Business name is required."),
  contactName: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
  category: z.string().optional(),
  tier: z.enum(["bronze", "silver", "gold"]).default("bronze"),
  status: z.enum(["active", "pending", "lapsed", "archived"]).default("active"),
  notes: z.string().optional(),
});

export async function createMember(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to add members." };
  }

  const parsed = MemberSchema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    category: formData.get("category") || undefined,
    tier: formData.get("tier") || "bronze",
    status: formData.get("status") || "active",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();

  if (org.memberLimit !== null) {
    const { count } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id)
      .neq("status", "archived");

    if ((count ?? 0) >= org.memberLimit) {
      return {
        error: `You've reached your plan's limit of ${org.memberLimit} members. Upgrade your plan to add more.`,
      };
    }
  }

  const { data, error } = await supabase
    .from("members")
    .insert({
      org_id: org.id,
      business_name: parsed.data.businessName,
      contact_name: parsed.data.contactName ?? null,
      email: parsed.data.email || null,
      phone: parsed.data.phone ?? null,
      category: parsed.data.category ?? null,
      tier: parsed.data.tier,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not create member." };
  }

  // Create a matching directory listing (private by default) so staff can
  // opt it into the public Business Directory later without extra setup.
  await supabase.from("directory_listings").insert({
    org_id: org.id,
    member_id: data.id,
    is_public: false,
  });

  revalidatePath("/members");
  redirect("/members");
}

export async function updateMember(
  memberId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to edit members." };
  }

  const parsed = MemberSchema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    category: formData.get("category") || undefined,
    tier: formData.get("tier") || "bronze",
    status: formData.get("status") || "active",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      business_name: parsed.data.businessName,
      contact_name: parsed.data.contactName ?? null,
      email: parsed.data.email || null,
      phone: parsed.data.phone ?? null,
      category: parsed.data.category ?? null,
      tier: parsed.data.tier,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", memberId)
    .eq("org_id", org.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/members");
  redirect("/members");
}

export async function archiveMember(memberId: string) {
  const org = await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("members")
    .update({ status: "archived" })
    .eq("id", memberId)
    .eq("org_id", org.id);
  revalidatePath("/members");
}

export async function deleteMember(memberId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;
  const supabase = await createClient();
  await supabase.from("members").delete().eq("id", memberId).eq("org_id", org.id);
  revalidatePath("/members");
}

// Invites an existing business member to create their own portal login,
// linking the resulting auth user to this `members` row on acceptance
// (see app/api/invites/[token]/accept/route.ts).
export async function inviteMemberToPortal(
  memberId: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to invite members." };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("id, email, user_id")
    .eq("id", memberId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!member) return { error: "Member not found." };
  if (member.user_id) return { error: "This member already has portal access." };
  if (!member.email) return { error: "Add an email address for this member first." };

  const { data: userResult } = await supabase.auth.getUser();
  const admin = createAdminClient();

  const { data: invite, error } = await admin
    .from("org_invites")
    .insert({
      org_id: org.id,
      email: member.email,
      role: "member",
      member_id: member.id,
      invited_by: userResult.user?.id,
    })
    .select()
    .single();

  if (error || !invite) {
    return {
      error: error?.message ?? "Could not create invite (maybe already pending).",
    };
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${invite.token}`;
  await admin.auth.admin.inviteUserByEmail(member.email, { redirectTo: inviteUrl });

  revalidatePath(`/members/${memberId}`);
  return { success: true };
}
