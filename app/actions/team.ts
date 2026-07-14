"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";

export type FormState = { error?: string; success?: boolean } | undefined;

const InviteSchema = z.object({
  email: z.email("Enter a valid email address."),
  role: z.enum(["admin", "staff"]),
});

export async function inviteTeamMember(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireRole("admin");

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: invite, error } = await admin
    .from("org_invites")
    .insert({
      org_id: org.id,
      email: parsed.data.email,
      role: parsed.data.role,
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
  await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: inviteUrl,
  });

  revalidatePath("/settings/team");
  return { success: true };
}

export async function removeTeamMember(orgMemberId: string) {
  const org = await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("org_members")
    .delete()
    .eq("id", orgMemberId)
    .eq("org_id", org.id);
  revalidatePath("/settings/team");
}

export async function revokeInvite(inviteId: string) {
  const org = await requireRole("admin");
  const supabase = await createClient();
  await supabase
    .from("org_invites")
    .delete()
    .eq("id", inviteId)
    .eq("org_id", org.id);
  revalidatePath("/settings/team");
}
