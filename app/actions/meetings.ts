"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute } from "@/lib/db/mysql";
import { requireOrg, requireMember } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const MeetingSchema = z.object({
  title: z.string().min(1, "Title is required."),
  meetingType: z.string().optional(),
  format: z.enum(["in_person", "virtual", "hybrid"]).default("in_person"),
  location: z.string().optional(),
  startsAt: z.string().min(1, "Date/time is required."),
  durationMinutes: z.coerce.number().int().min(15).default(60),
  agenda: z.string().optional(),
  minutesDocumentId: z.string().optional(),
});

export async function createMeeting(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to schedule meetings." };
  }

  const parsed = MeetingSchema.safeParse({
    title: formData.get("title"),
    meetingType: formData.get("meetingType") || undefined,
    format: formData.get("format") || "in_person",
    location: formData.get("location") || undefined,
    startsAt: formData.get("startsAt"),
    durationMinutes: formData.get("durationMinutes") || 60,
    agenda: formData.get("agenda") || undefined,
    minutesDocumentId: formData.get("minutesDocumentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const meetingId = crypto.randomUUID();
  const startsAt = new Date(parsed.data.startsAt);

  try {
    await execute(
      `INSERT INTO meetings (
        id, org_id, title, meeting_type, format, location, starts_at, duration_minutes, agenda, minutes_document_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        meetingId,
        org.id,
        parsed.data.title,
        parsed.data.meetingType ?? null,
        parsed.data.format,
        parsed.data.location ?? null,
        startsAt,
        parsed.data.durationMinutes,
        parsed.data.agenda ?? null,
        parsed.data.minutesDocumentId || null,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not create meeting." };
  }

  revalidatePath("/meetings");
  redirect("/meetings");
}

export async function deleteMeeting(meetingId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute("DELETE FROM meetings WHERE id = ? AND org_id = ?", [
    meetingId,
    org.id,
  ]);
  revalidatePath("/meetings");
}

export async function setMeetingMinutes(meetingId: string, formData: FormData) {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) return;

  const documentId = String(formData.get("minutesDocumentId") || "") || null;

  await execute(
    "UPDATE meetings SET minutes_document_id = ? WHERE id = ? AND org_id = ?",
    [documentId, meetingId, org.id]
  );

  revalidatePath("/meetings");
}

export async function rsvpToMeeting(meetingId: string) {
  const member = await requireMember();
  const rsvpId = crypto.randomUUID();

  await execute(
    `INSERT INTO meeting_rsvps (id, org_id, meeting_id, member_id)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE id = id`,
    [rsvpId, member.orgId, meetingId, member.id]
  );

  revalidatePath("/portal/meetings");
}

export async function cancelRsvp(meetingId: string) {
  const member = await requireMember();

  await execute(
    "DELETE FROM meeting_rsvps WHERE meeting_id = ? AND member_id = ?",
    [meetingId, member.id]
  );

  revalidatePath("/portal/meetings");
}
