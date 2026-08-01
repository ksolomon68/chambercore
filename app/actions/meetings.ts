"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.from("meetings").insert({
    org_id: org.id,
    title: parsed.data.title,
    meeting_type: parsed.data.meetingType ?? null,
    format: parsed.data.format,
    location: parsed.data.location ?? null,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    duration_minutes: parsed.data.durationMinutes,
    agenda: parsed.data.agenda ?? null,
    minutes_document_id: parsed.data.minutesDocumentId || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/meetings");
  redirect("/meetings");
}

export async function deleteMeeting(meetingId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase.from("meetings").delete().eq("id", meetingId).eq("org_id", org.id);
  revalidatePath("/meetings");
}

export async function setMeetingMinutes(meetingId: string, formData: FormData) {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) return;

  const documentId = String(formData.get("minutesDocumentId") || "") || null;

  const supabase = await createClient();
  await supabase
    .from("meetings")
    .update({ minutes_document_id: documentId })
    .eq("id", meetingId)
    .eq("org_id", org.id);

  revalidatePath("/meetings");
}

export async function rsvpToMeeting(meetingId: string) {
  const member = await requireMember();
  const supabase = await createClient();
  await supabase.from("meeting_rsvps").insert({
    org_id: member.orgId,
    meeting_id: meetingId,
    member_id: member.id,
  });
  revalidatePath("/portal/meetings");
}

export async function cancelRsvp(meetingId: string) {
  const member = await requireMember();
  const supabase = await createClient();
  await supabase
    .from("meeting_rsvps")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("member_id", member.id);
  revalidatePath("/portal/meetings");
}
