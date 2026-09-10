"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { execute } from "@/lib/db/mysql";
import { requireOrg } from "@/lib/auth/session";
import { canEditMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string } | undefined;

const ListingSchema = z.object({
  isPublic: z.enum(["on"]).optional(),
  featured: z.enum(["on"]).optional(),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  address: z.string().optional(),
});

export async function updateListing(
  memberId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to edit the directory." };
  }

  const parsed = ListingSchema.safeParse({
    isPublic: formData.get("isPublic") ?? undefined,
    featured: formData.get("featured") ?? undefined,
    description: formData.get("description") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid input." };
  }

  try {
    await execute(
      `UPDATE directory_listings
       SET is_public = ?, featured = ?, description = ?, website_url = ?, address = ?
       WHERE member_id = ? AND org_id = ?`,
      [
        parsed.data.isPublic === "on" ? 1 : 0,
        parsed.data.featured === "on" ? 1 : 0,
        parsed.data.description ?? null,
        parsed.data.websiteUrl ?? null,
        parsed.data.address ?? null,
        memberId,
        org.id,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not update listing." };
  }

  revalidatePath("/directory");
  revalidatePath(`/c/${org.slug}`);
  return undefined;
}
