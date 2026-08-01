"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireMember } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export type FormState = { error?: string; success?: boolean } | undefined;

const ProfileSchema = z.object({
  contactName: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

// Members write through the service-role client rather than an RLS update
// policy: the ownership check below (requireMember() + .eq("id", member.id))
// is what keeps this scoped to the caller's own row, and it lets us leave
// tier/status/business_name out of what a member can touch without needing
// column-level RLS.
export async function updateMyProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const member = await requireMember();

  const parsed = ProfileSchema.safeParse({
    contactName: formData.get("contactName") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("members")
    .update({
      contact_name: parsed.data.contactName ?? null,
      email: parsed.data.email || null,
      phone: parsed.data.phone ?? null,
    })
    .eq("id", member.id);

  if (error) return { error: error.message };

  revalidatePath("/portal/profile");
  return { success: true };
}

const ListingSchema = z.object({
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  address: z.string().optional(),
});

export async function updateMyListing(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const member = await requireMember();

  const parsed = ListingSchema.safeParse({
    description: formData.get("description") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const admin = createAdminClient();
  // is_public/featured are omitted so staff curation is never overwritten by
  // a member's own edit — createMember() always creates this row up front.
  const { error } = await admin.from("directory_listings").upsert(
    {
      org_id: member.orgId,
      member_id: member.id,
      description: parsed.data.description ?? null,
      website_url: parsed.data.websiteUrl ?? null,
      address: parsed.data.address ?? null,
    },
    { onConflict: "member_id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/portal/profile");
  return { success: true };
}
