"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute } from "@/lib/db/mysql";
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

  const issueId = crypto.randomUUID();
  const d = parsed.data;

  try {
    await execute(
      `INSERT INTO advocacy_issues (
        id, org_id, title, description, status, position,
        cta_headline, cta_email_subject, cta_email_body, goal_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        issueId,
        org.id,
        d.title,
        d.description ?? null,
        d.status,
        d.position ?? null,
        d.ctaHeadline ?? null,
        d.ctaEmailSubject ?? null,
        d.ctaEmailBody ?? null,
        d.goalCount ?? null,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not create advocacy issue." };
  }

  revalidatePath("/advocacy");
  redirect("/advocacy");
}

export async function deleteIssue(issueId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "DELETE FROM advocacy_issues WHERE id = ? AND org_id = ?",
    [issueId, org.id]
  );
  revalidatePath("/advocacy");
}

const OfficialSchema = z.object({
  name: z.string().min(1, "Name is required."),
  title: z.string().optional(),
  level: z.enum(["federal", "state", "local"]).default("local"),
  email: z.string().email().optional().or(z.literal("")),
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

  const officialId = crypto.randomUUID();

  try {
    await execute(
      `INSERT INTO officials (id, org_id, name, title, level, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        officialId,
        org.id,
        parsed.data.name,
        parsed.data.title ?? null,
        parsed.data.level,
        parsed.data.email || null,
        parsed.data.phone ?? null,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not create official." };
  }

  revalidatePath("/advocacy");
  redirect("/advocacy");
}

export async function deleteOfficial(officialId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "DELETE FROM officials WHERE id = ? AND org_id = ?",
    [officialId, org.id]
  );
  revalidatePath("/advocacy");
}

export async function logAction(issueId: string) {
  const member = await requireMember();
  const logId = crypto.randomUUID();

  await execute(
    `INSERT INTO advocacy_action_log (id, org_id, issue_id, member_id)
     VALUES (?, ?, ?, ?)`,
    [logId, member.orgId, issueId, member.id]
  );

  revalidatePath("/portal/advocacy");
  revalidatePath("/advocacy");
}
