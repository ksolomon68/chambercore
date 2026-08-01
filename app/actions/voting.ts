"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: vote, error } = await supabase
    .from("votes")
    .insert({
      org_id: org.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      closes_at: parsed.data.closesAt
        ? new Date(parsed.data.closesAt).toISOString()
        : null,
    })
    .select()
    .single();

  if (error || !vote) {
    return { error: error?.message ?? "Could not create vote." };
  }

  await supabase.from("vote_options").insert(
    options.map((label, i) => ({
      org_id: org.id,
      vote_id: vote.id,
      label,
      position: i,
    })),
  );

  revalidatePath("/voting");
  redirect("/voting");
}

export async function closeVote(voteId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase
    .from("votes")
    .update({ status: "closed" })
    .eq("id", voteId)
    .eq("org_id", org.id);

  revalidatePath("/voting");
  revalidatePath("/board");
}

export async function castVote(voteId: string, formData: FormData) {
  const member = await requireMember();
  const optionId = String(formData.get("optionId") || "");
  if (!optionId) return;

  const supabase = await createClient();
  const { data: boardMember } = await supabase
    .from("board_members")
    .select("id")
    .eq("org_id", member.orgId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (!boardMember) return;

  await supabase.from("vote_casts").insert({
    org_id: member.orgId,
    vote_id: voteId,
    option_id: optionId,
    board_member_id: boardMember.id,
  });

  revalidatePath("/portal/voting");
}
