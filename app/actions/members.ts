"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { query, queryOne, execute, transaction } from "@/lib/db/mysql";
import { requireOrg, requireRole, getCurrentUser } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const MemberSchema = z.object({
  businessName: z.string().min(1, "Business name is required."),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
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

  if (org.memberLimit !== null) {
    const memberCount = await queryOne<{ total: number }>(
      "SELECT COUNT(*) as total FROM members WHERE org_id = ? AND status != 'archived'",
      [org.id]
    );

    if ((memberCount?.total ?? 0) >= org.memberLimit) {
      return {
        error: `You've reached your plan's limit of ${org.memberLimit} members. Upgrade your plan to add more.`,
      };
    }
  }

  const memberId = crypto.randomUUID();
  const directoryListingId = crypto.randomUUID();
  const memberSince = new Date().toISOString().split("T")[0];

  try {
    await transaction(async (conn) => {
      // 1. Insert Member
      await conn.execute(
        `INSERT INTO members (id, org_id, business_name, contact_name, email, phone, category, tier, status, notes, member_since)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          memberId,
          org.id,
          parsed.data.businessName,
          parsed.data.contactName ?? null,
          parsed.data.email || null,
          parsed.data.phone ?? null,
          parsed.data.category ?? null,
          parsed.data.tier,
          parsed.data.status,
          parsed.data.notes ?? null,
          memberSince,
        ]
      );

      // 2. Create matching directory listing
      await conn.execute(
        `INSERT INTO directory_listings (id, org_id, member_id, is_public)
         VALUES (?, ?, ?, ?)`,
        [directoryListingId, org.id, memberId, 0]
      );
    });
  } catch (error: any) {
    console.error("Failed to create member:", error);
    return { error: error?.message || "Could not create member." };
  }

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

  try {
    await execute(
      `UPDATE members
       SET business_name = ?, contact_name = ?, email = ?, phone = ?, category = ?, tier = ?, status = ?, notes = ?
       WHERE id = ? AND org_id = ?`,
      [
        parsed.data.businessName,
        parsed.data.contactName ?? null,
        parsed.data.email || null,
        parsed.data.phone ?? null,
        parsed.data.category ?? null,
        parsed.data.tier,
        parsed.data.status,
        parsed.data.notes ?? null,
        memberId,
        org.id,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not update member." };
  }

  revalidatePath("/members");
  redirect("/members");
}

export async function archiveMember(memberId: string) {
  const org = await requireRole("admin");
  await execute("UPDATE members SET status = 'archived' WHERE id = ? AND org_id = ?", [
    memberId,
    org.id,
  ]);
  revalidatePath("/members");
}

export async function deleteMember(memberId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;
  await execute("DELETE FROM members WHERE id = ? AND org_id = ?", [
    memberId,
    org.id,
  ]);
  revalidatePath("/members");
}

export async function inviteMemberToPortal(
  memberId: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to invite members." };
  }

  const member = await queryOne<{ id: string; email: string | null; user_id: string | null }>(
    "SELECT id, email, user_id FROM members WHERE id = ? AND org_id = ?",
    [memberId, org.id]
  );

  if (!member) return { error: "Member not found." };
  if (member.user_id) return { error: "This member already has portal access." };
  if (!member.email) return { error: "Add an email address for this member first." };

  const user = await getCurrentUser();
  const inviteId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  try {
    await execute(
      `INSERT INTO org_invites (id, org_id, email, role, token, member_id, invited_by, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inviteId,
        org.id,
        member.email.toLowerCase(),
        "member",
        token,
        member.id,
        user?.id ?? null,
        expiresAt,
      ]
    );
  } catch (error: any) {
    return {
      error: error?.message?.includes("Duplicate")
        ? "An invite for this email is already pending."
        : "Could not create invite.",
    };
  }

  revalidatePath(`/members/${memberId}`);
  return { success: true };
}
