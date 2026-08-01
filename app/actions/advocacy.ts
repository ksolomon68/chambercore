"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireOrg, requireMember } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const IssueSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  status: z.enum(["urgent", "watch", "monitoring", "resolved"]).default("monitoring"),
  position: z.string().optional(),
  ctaHeadline: z.string().optional(),
  ctaEmailSubject: z.string().optional(),
  ctaEmailBody: z.string().optional(),
  goalCount: z.coerce.number().int().min(0).optional(),
});

export async function createIssue(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to manage advocacy issues." };
  }

  const parsed = IssueSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "monitoring",
    position: formData.get("position") || undefined,
    ctaHeadline: formData.get("ctaHeadline") || undefined,
    ctaEmailSubject: formData.get("ctaEmailSubject") || undefined,
    ctaEmailBody: formData.get("ctaEmailBody") || undefined,
    goalCount: formData.get("goalCount") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("advocacy_issues").insert({
    org_id: org.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    status: parsed.data.status,
    position: parsed.data.position ?? null,
    cta_headline: parsed.data.ctaHeadline ?? null,
    cta_email_subject: parsed.data.ctaEmailSubject ?? null,
    cta_email_body: parsed.data.ctaEmailBody ?? null,
    goal_count: parsed.data.goalCount ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/advocacy");
  redirect("/advocacy");
}

export async function deleteIssue(issueId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase.from("advocacy_issues").delete().eq("id", issueId).eq("org_id", org.id);
  revalidatePath("/advocacy");
}

const OfficialSchema = z.object({
  name: z.string().min(1, "Name is required."),
  title: z.string().optional(),
  level: z.enum(["federal", "state", "local"]).default("local"),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export async function createOfficial(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to manage officials." };
  }

  const parsed = OfficialSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") || undefined,
    level: formData.get("level") || "local",
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("officials").insert({
    org_id: org.id,
    name: parsed.data.name,
    title: parsed.data.title ?? null,
    level: parsed.data.level,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/advocacy");
  redirect("/advocacy");
}

export async function deleteOfficial(officialId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase.from("officials").delete().eq("id", officialId).eq("org_id", org.id);
  revalidatePath("/advocacy");
}

export async function logAction(issueId: string) {
  const member = await requireMember();
  const supabase = await createClient();
  await supabase.from("advocacy_action_log").insert({
    org_id: member.orgId,
    issue_id: issueId,
    member_id: member.id,
  });
  revalidatePath("/portal/advocacy");
  revalidatePath("/advocacy");
}
