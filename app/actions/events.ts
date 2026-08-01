"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    org_id: org.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    location: parsed.data.location ?? null,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    price: parsed.data.price ?? null,
    capacity: parsed.data.capacity ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/events");
  redirect("/events");
}

export async function deleteEvent(eventId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId).eq("org_id", org.id);
  revalidatePath("/events");
}

export async function registerForEvent(eventId: string) {
  const member = await requireMember();
  const supabase = await createClient();
  await supabase.from("event_registrations").insert({
    org_id: member.orgId,
    event_id: eventId,
    member_id: member.id,
  });
  revalidatePath("/portal/events");
}

export async function cancelRegistration(eventId: string) {
  const member = await requireMember();
  const supabase = await createClient();
  await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("member_id", member.id);
  revalidatePath("/portal/events");
}
