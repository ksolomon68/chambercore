"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireOrg, requireMember } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const ListingSchema = z.object({
  kind: z.enum(["deal", "job"]),
  title: z.string().min(1, "Title is required."),
  category: z.string().optional(),
  description: z.string().optional(),
  discountLabel: z.string().optional(),
  promoCode: z.string().optional(),
  expiresAt: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]).optional(),
  location: z.string().optional(),
  payRange: z.string().optional(),
});

function parseListingForm(formData: FormData) {
  return ListingSchema.safeParse({
    kind: formData.get("kind"),
    title: formData.get("title"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    discountLabel: formData.get("discountLabel") || undefined,
    promoCode: formData.get("promoCode") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
    employmentType: formData.get("employmentType") || undefined,
    location: formData.get("location") || undefined,
    payRange: formData.get("payRange") || undefined,
  });
}

// Staff-posted listings go live immediately (staff already curate everything
// else in this app); member-submitted ones need approval (see submitListing).
export async function createListing(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to post to the marketplace." };
  }

  const memberId = String(formData.get("memberId") || "");
  if (!memberId) return { error: "Choose a member." };

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!member) return { error: "Member not found." };

  const { error } = await supabase.from("marketplace_listings").insert({
    org_id: org.id,
    member_id: memberId,
    status: "approved",
    ...listingFields(parsed.data),
  });

  if (error) return { error: error.message };

  revalidatePath("/marketplace");
  redirect("/marketplace");
}

export async function submitListing(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const member = await requireMember();

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("marketplace_listings").insert({
    org_id: member.orgId,
    member_id: member.id,
    status: "pending",
    ...listingFields(parsed.data),
  });

  if (error) return { error: error.message };

  revalidatePath("/portal/marketplace");
  redirect("/portal/marketplace");
}

function listingFields(data: z.infer<typeof ListingSchema>) {
  return {
    kind: data.kind,
    title: data.title,
    category: data.category ?? null,
    description: data.description ?? null,
    discount_label: data.discountLabel ?? null,
    promo_code: data.promoCode ?? null,
    expires_at: data.expiresAt || null,
    employment_type: data.employmentType ?? null,
    location: data.location ?? null,
    pay_range: data.payRange ?? null,
  };
}

export async function approveListing(listingId: string) {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) return;

  const supabase = await createClient();
  await supabase
    .from("marketplace_listings")
    .update({ status: "approved" })
    .eq("id", listingId)
    .eq("org_id", org.id);

  revalidatePath("/marketplace");
}

export async function archiveListing(listingId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase
    .from("marketplace_listings")
    .update({ status: "archived" })
    .eq("id", listingId)
    .eq("org_id", org.id);

  revalidatePath("/marketplace");
}
