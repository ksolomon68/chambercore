"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { execute } from "@/lib/db/mysql";
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

  try {
    await execute(
      "UPDATE organizations SET name = ?, primary_color = ? WHERE id = ?",
      [parsed.data.name, parsed.data.primaryColor, org.id]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not update organization." };
  }

  revalidatePath("/settings/organization");
  return { success: true };
}
