"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute, transaction } from "@/lib/db/mysql";
import { requireOrg } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const CommitteeSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  committeeType: z.enum(["executive", "finance", "committee"]).default("committee"),
  chairBoardMemberId: z.string().optional(),
  nextMeetingAt: z.string().optional(),
});

export async function createCommittee(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to manage committees." };
  }

  const parsed = CommitteeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    committeeType: formData.get("committeeType") || "committee",
    chairBoardMemberId: formData.get("chairBoardMemberId") || undefined,
    nextMeetingAt: formData.get("nextMeetingAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const memberIds = formData.getAll("boardMemberIds").map(String).filter(Boolean);
  const committeeId = crypto.randomUUID();
  const nextMeeting = parsed.data.nextMeetingAt ? new Date(parsed.data.nextMeetingAt) : null;

  try {
    await transaction(async (conn) => {
      // 1. Insert Committee
      await conn.execute(
        `INSERT INTO committees (
          id, org_id, name, description, committee_type, chair_board_member_id, next_meeting_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          committeeId,
          org.id,
          parsed.data.name,
          parsed.data.description ?? null,
          parsed.data.committeeType,
          parsed.data.chairBoardMemberId || null,
          nextMeeting,
        ]
      );

      // 2. Insert memberships
      for (const boardMemberId of memberIds) {
        const membershipId = crypto.randomUUID();
        await conn.execute(
          `INSERT INTO committee_memberships (id, org_id, committee_id, board_member_id)
           VALUES (?, ?, ?, ?)`,
          [membershipId, org.id, committeeId, boardMemberId]
        );
      }
    });
  } catch (error: any) {
    return { error: error?.message || "Could not create committee." };
  }

  revalidatePath("/committees");
  redirect("/committees");
}

export async function deleteCommittee(committeeId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "DELETE FROM committees WHERE id = ? AND org_id = ?",
    [committeeId, org.id]
  );

  revalidatePath("/committees");
}
