"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", parsed.data.memberId)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!member) return { error: "Member not found." };

  const { error } = await supabase.from("dues_invoices").insert({
    org_id: org.id,
    member_id: parsed.data.memberId,
    description: parsed.data.description,
    amount: parsed.data.amount,
    due_date: parsed.data.dueDate,
  });

  if (error) return { error: error.message };

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

  const supabase = await createClient();
  await supabase
    .from("dues_invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: method,
    })
    .eq("id", invoiceId)
    .eq("org_id", org.id);

  revalidatePath("/dues");
}

export async function voidInvoice(invoiceId: string) {
  const org = await requireOrg();
  if (!canDeleteMembers(org.role)) return;

  const supabase = await createClient();
  await supabase
    .from("dues_invoices")
    .update({ status: "void" })
    .eq("id", invoiceId)
    .eq("org_id", org.id);

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

  const supabase = await createClient();
  const rows = (["bronze", "silver", "gold"] as const)
    .filter((tier) => parsed.data[tier] !== undefined)
    .map((tier) => ({
      org_id: org.id,
      tier,
      annual_price: parsed.data[tier],
    }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("dues_tier_pricing")
      .upsert(rows, { onConflict: "org_id,tier" });

    if (error) return { error: error.message };
  }

  revalidatePath("/dues");
  return { success: true };
}
