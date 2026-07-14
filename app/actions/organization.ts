"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";

export type FormState = { error?: string; success?: boolean } | undefined;

const OrgSchema = z.object({
  name: z.string().min(2, "Chamber name must be at least 2 characters."),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color like #C8942A."),
});

export async function updateOrganization(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireRole("admin");

  const parsed = OrgSchema.safeParse({
    name: formData.get("name"),
    primaryColor: formData.get("primaryColor"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name, primary_color: parsed.data.primaryColor })
    .eq("id", org.id);

  if (error) return { error: error.message };

  revalidatePath("/settings/organization");
  return { success: true };
}
