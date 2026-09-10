"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute, queryOne } from "@/lib/db/mysql";
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

  const member = await queryOne<{ id: string }>(
    "SELECT id FROM members WHERE id = ? AND org_id = ?",
    [memberId, org.id]
  );

  if (!member) return { error: "Member not found." };

  const listingId = crypto.randomUUID();
  const d = parsed.data;

  try {
    await execute(
      `INSERT INTO marketplace_listings (
        id, org_id, member_id, kind, title, category, description,
        discount_label, promo_code, expires_at, employment_type, location, pay_range, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listingId,
        org.id,
        memberId,
        d.kind,
        d.title,
        d.category ?? null,
        d.description ?? null,
        d.discountLabel ?? null,
        d.promoCode ?? null,
        d.expiresAt ? new Date(d.expiresAt) : null,
        d.employmentType ?? null,
        d.location ?? null,
        d.payRange ?? null,
        "approved",
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not create listing." };
  }

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

  const listingId = crypto.randomUUID();
  const d = parsed.data;

  try {
    await execute(
      `INSERT INTO marketplace_listings (
        id, org_id, member_id, kind, title, category, description,
        discount_label, promo_code, expires_at, employment_type, location, pay_range, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listingId,
        member.orgId,
        member.id,
        d.kind,
        d.title,
        d.category ?? null,
        d.description ?? null,
        d.discountLabel ?? null,
        d.promoCode ?? null,
        d.expiresAt ? new Date(d.expiresAt) : null,
        d.employmentType ?? null,
        d.location ?? null,
        d.payRange ?? null,
        "pending",
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not submit listing." };
  }

  revalidatePath("/portal/marketplace");
  redirect("/portal/marketplace");
}

export async function approveListing(listingId: string) {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) return;

  await execute(
    "UPDATE marketplace_listings SET status = 'approved' WHERE id = ? AND org_id = ?",
    [listingId, org.id]
  );

  revalidatePath("/marketplace");
}

export async function archiveListing(listingId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "UPDATE marketplace_listings SET status = 'archived' WHERE id = ? AND org_id = ?",
    [listingId, org.id]
  );

  revalidatePath("/marketplace");
}
