"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase
    .from("directory_listings")
    .update({
      is_public: parsed.data.isPublic === "on",
      featured: parsed.data.featured === "on",
      description: parsed.data.description ?? null,
      website_url: parsed.data.websiteUrl ?? null,
      address: parsed.data.address ?? null,
    })
    .eq("member_id", memberId)
    .eq("org_id", org.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/directory");
  revalidatePath(`/c/${org.slug}`);
  return undefined;
}
