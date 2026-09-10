"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { execute, queryOne } from "@/lib/db/mysql";
import { requireOrg, requireRole } from "@/lib/auth/session";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";
import type { DuesPaymentMethod } from "@/lib/types/database.types";

const PAYMENT_METHODS: DuesPaymentMethod[] = ["cash", "check", "card", "ach", "other"];

export type FormState = { error?: string; success?: boolean } | undefined;

const InvoiceSchema = z.object({
  memberId: z.string().min(1, "Choose a member."),
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().min(0, "Amount must be zero or more."),
  dueDate: z.string().min(1, "Due date is required."),
});

export async function createInvoice(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) {
    return { error: "You don't have permission to create invoices." };
  }

  const parsed = InvoiceSchema.safeParse({
    memberId: formData.get("memberId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const member = await queryOne<{ id: string }>(
    "SELECT id FROM members WHERE id = ? AND org_id = ?",
    [parsed.data.memberId, org.id]
  );

  if (!member) return { error: "Member not found." };

  const invoiceId = crypto.randomUUID();

  try {
    await execute(
      `INSERT INTO dues_invoices (id, org_id, member_id, description, amount, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        org.id,
        parsed.data.memberId,
        parsed.data.description,
        parsed.data.amount,
        parsed.data.dueDate,
      ]
    );
  } catch (error: any) {
    return { error: error?.message || "Could not create invoice." };
  }

  revalidatePath("/dues");
  redirect("/dues");
}

export async function markInvoicePaid(invoiceId: string, formData: FormData) {
  const org = await requireOrg();
  if (!canEditMembers(org.role)) return;

  const rawMethod = String(formData.get("method") || "");
  const method = PAYMENT_METHODS.includes(rawMethod as DuesPaymentMethod)
    ? (rawMethod as DuesPaymentMethod)
    : null;

  await execute(
    `UPDATE dues_invoices
     SET status = 'paid', paid_at = NOW(), payment_method = ?
     WHERE id = ? AND org_id = ?`,
    [method, invoiceId, org.id]
  );

  revalidatePath("/dues");
}

export async function voidInvoice(invoiceId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  await execute(
    "UPDATE dues_invoices SET status = 'void' WHERE id = ? AND org_id = ?",
    [invoiceId, org.id]
  );

  revalidatePath("/dues");
}

const PricingSchema = z.object({
  bronze: z.coerce.number().min(0).optional(),
  silver: z.coerce.number().min(0).optional(),
  gold: z.coerce.number().min(0).optional(),
});

export async function updateTierPricing(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const org = await requireRole("admin");

  const parsed = PricingSchema.safeParse({
    bronze: formData.get("bronze") || undefined,
    silver: formData.get("silver") || undefined,
    gold: formData.get("gold") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const tiers = (["bronze", "silver", "gold"] as const).filter(
    (tier) => parsed.data[tier] !== undefined
  );

  try {
    for (const tier of tiers) {
      const price = parsed.data[tier];
      const tierPricingId = crypto.randomUUID();
      await execute(
        `INSERT INTO dues_tier_pricing (id, org_id, tier, annual_price)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE annual_price = VALUES(annual_price)`,
        [tierPricingId, org.id, tier, price]
      );
    }
  } catch (error: any) {
    return { error: error?.message || "Could not update tier pricing." };
  }

  revalidatePath("/dues");
  return { success: true };
}
