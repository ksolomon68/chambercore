"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.from("board_members").insert({
    org_id: org.id,
    name: parsed.data.name,
    title: parsed.data.title ?? null,
    member_id: parsed.data.memberId || null,
    is_executive: parsed.data.isExecutive ?? false,
  });

  if (error) return { error: error.message };

  revalidatePath("/board");
  redirect("/board");
}

export async function deleteBoardMember(boardMemberId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase
    .from("board_members")
    .delete()
    .eq("id", boardMemberId)
    .eq("org_id", org.id);

  revalidatePath("/board");
}
