"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute } from "@/lib/db/mysql";
import { requireMember } from "@/lib/auth/session";

export type FormState = { error?: string; success?: boolean } | undefined;

const ProfileSchema = z.object({
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

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

  try {
    await execute(
      "UPDATE members SET contact_name = ?, email = ?, phone = ? WHERE id = ?",
      [
        parsed.data.contactName ?? null,
        parsed.data.email || null,
        parsed.data.phone ?? null,
        member.id,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not update profile." };
  }

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

  const listingId = crypto.randomUUID();

  try {
    await execute(
      `INSERT INTO directory_listings (id, org_id, member_id, description, website_url, address)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         description = VALUES(description),
         website_url = VALUES(website_url),
         address = VALUES(address)`,
      [
        listingId,
        member.orgId,
        member.id,
        parsed.data.description ?? null,
        parsed.data.websiteUrl ?? null,
        parsed.data.address ?? null,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not update directory listing." };
  }

  revalidatePath("/portal/profile");
  return { success: true };
}
