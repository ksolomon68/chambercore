"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute } from "@/lib/db/mysql";
import { requireOrg, requireMember } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";

export type FormState = { error?: string; success?: boolean } | undefined;

const EventSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().min(1, "Start date/time is required."),
  price: z.coerce.number().min(0).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
});

export async function createEvent(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to create events." };
  }

  const parsed = EventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    startsAt: formData.get("startsAt"),
    price: formData.get("price") || undefined,
    capacity: formData.get("capacity") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const eventId = crypto.randomUUID();
  const startsAt = new Date(parsed.data.startsAt);

  try {
    await execute(
      `INSERT INTO events (id, org_id, title, description, location, starts_at, price, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        org.id,
        parsed.data.title,
        parsed.data.description ?? null,
        parsed.data.location ?? null,
        startsAt,
        parsed.data.price ?? null,
        parsed.data.capacity ?? null,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not create event." };
  }

  revalidatePath("/events");
  redirect("/events");
}

export async function deleteEvent(eventId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute("DELETE FROM events WHERE id = ? AND org_id = ?", [
    eventId,
    org.id,
  ]);
  revalidatePath("/events");
}

export async function registerForEvent(eventId: string) {
  const member = await requireMember();
  const regId = crypto.randomUUID();

  await execute(
    `INSERT INTO event_registrations (id, org_id, event_id, member_id)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE id = id`,
    [regId, member.orgId, eventId, member.id]
  );

  revalidatePath("/portal/events");
}

export async function cancelRegistration(eventId: string) {
  const member = await requireMember();

  await execute(
    "DELETE FROM event_registrations WHERE event_id = ? AND member_id = ?",
    [eventId, member.id]
  );

  revalidatePath("/portal/events");
}
