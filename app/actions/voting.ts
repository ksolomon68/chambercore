"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute, queryOne, transaction } from "@/lib/db/mysql";
import { requireOrg, requireMember } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const VoteSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  closesAt: z.string().optional(),
});

export async function createVote(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to create votes." };
  }

  const parsed = VoteSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    closesAt: formData.get("closesAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const options = formData
    .getAll("option")
    .map((o) => String(o).trim())
    .filter(Boolean);

  if (options.length < 2) {
    return { error: "Add at least two options." };
  }

  const voteId = crypto.randomUUID();
  const closesAt = parsed.data.closesAt ? new Date(parsed.data.closesAt) : null;

  try {
    await transaction(async (conn) => {
      // 1. Insert Vote
      await conn.execute(
        `INSERT INTO votes (id, org_id, title, description, closes_at, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          voteId,
          org.id,
          parsed.data.title,
          parsed.data.description ?? null,
          closesAt,
          "open",
        ]
      );

      // 2. Insert Options
      for (let i = 0; i < options.length; i++) {
        const optionId = crypto.randomUUID();
        await conn.execute(
          `INSERT INTO vote_options (id, org_id, vote_id, label, position)
           VALUES (?, ?, ?, ?, ?)`,
          [optionId, org.id, voteId, options[i], i]
        );
      }
    });
  } catch (error: any) {
    return { error: error?.message || "Could not create vote." };
  }

  revalidatePath("/voting");
  redirect("/voting");
}

export async function closeVote(voteId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "UPDATE votes SET status = 'closed' WHERE id = ? AND org_id = ?",
    [voteId, org.id]
  );

  revalidatePath("/voting");
  revalidatePath("/board");
}

export async function castVote(voteId: string, formData: FormData) {
  const member = await requireMember();
  const optionId = String(formData.get("optionId") || "");
  if (!optionId) return;

  const boardMember = await queryOne<{ id: string }>(
    "SELECT id FROM board_members WHERE org_id = ? AND member_id = ?",
    [member.orgId, member.id]
  );

  if (!boardMember) return;

  const castId = crypto.randomUUID();

  await execute(
    `INSERT INTO vote_casts (id, org_id, vote_id, option_id, board_member_id)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE option_id = VALUES(option_id)`,
    [castId, member.orgId, voteId, optionId, boardMember.id]
  );

  revalidatePath("/portal/voting");
}
