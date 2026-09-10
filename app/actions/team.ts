"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute, queryOne } from "@/lib/db/mysql";
import { requireRole, getCurrentUser } from "@/lib/auth/session";

export type FormState = { error?: string; success?: boolean } | undefined;

const InviteSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(["admin", "staff"]),
});

export async function inviteTeamMember(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireRole("admin");
  const user = await getCurrentUser();

  const parsed = InviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const inviteId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await execute(
      `INSERT INTO org_invites (id, org_id, email, role, token, invited_by, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        inviteId,
        org.id,
        parsed.data.email.toLowerCase(),
        parsed.data.role,
        token,
        user?.id ?? null,
        expiresAt,
      ]
    );
  } catch (error: any) {
    console.error("Invite creation failed:", error);
    return {
      error: error?.message?.includes("Duplicate")
        ? "An invite for this email is already pending."
        : "Could not create invite.",
    };
  }

  revalidatePath("/settings/team");
  return { success: true };
}

export async function removeTeamMember(orgMemberId: string) {
  const org = await requireRole("admin");
  await execute("DELETE FROM org_members WHERE id = ? AND org_id = ?", [
    orgMemberId,
    org.id,
  ]);
  revalidatePath("/settings/team");
}

export async function revokeInvite(inviteId: string) {
  const org = await requireRole("admin");
  await execute("DELETE FROM org_invites WHERE id = ? AND org_id = ?", [
    inviteId,
    org.id,
  ]);
  revalidatePath("/settings/team");
}
