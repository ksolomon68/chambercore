"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: committee, error } = await supabase
    .from("committees")
    .insert({
      org_id: org.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      committee_type: parsed.data.committeeType,
      chair_board_member_id: parsed.data.chairBoardMemberId || null,
      next_meeting_at: parsed.data.nextMeetingAt
        ? new Date(parsed.data.nextMeetingAt).toISOString()
        : null,
    })
    .select()
    .single();

  if (error || !committee) {
    return { error: error?.message ?? "Could not create committee." };
  }

  if (memberIds.length > 0) {
    await supabase.from("committee_memberships").insert(
      memberIds.map((boardMemberId) => ({
        org_id: org.id,
        committee_id: committee.id,
        board_member_id: boardMemberId,
      })),
    );
  }

  revalidatePath("/committees");
  redirect("/committees");
}

export async function deleteCommittee(committeeId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase
    .from("committees")
    .delete()
    .eq("id", committeeId)
    .eq("org_id", org.id);

  revalidatePath("/committees");
}
