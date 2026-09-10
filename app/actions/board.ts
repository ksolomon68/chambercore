"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute } from "@/lib/db/mysql";
import { requireOrg } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const BoardMemberSchema = z.object({
  name: z.string().min(1, "Name is required."),
  title: z.string().optional(),
  memberId: z.string().optional(),
  isExecutive: z.coerce.boolean().optional(),
});

export async function createBoardMember(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to manage the board roster." };
  }

  const parsed = BoardMemberSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") || undefined,
    memberId: formData.get("memberId") || undefined,
    isExecutive: formData.get("isExecutive") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const boardMemberId = crypto.randomUUID();

  try {
    await execute(
      `INSERT INTO board_members (id, org_id, name, title, member_id, is_executive)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        boardMemberId,
        org.id,
        parsed.data.name,
        parsed.data.title ?? null,
        parsed.data.memberId || null,
        parsed.data.isExecutive ? 1 : 0,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not add board member." };
  }

  revalidatePath("/board");
  redirect("/board");
}

export async function deleteBoardMember(boardMemberId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "DELETE FROM board_members WHERE id = ? AND org_id = ?",
    [boardMemberId, org.id]
  );

  revalidatePath("/board");
}
