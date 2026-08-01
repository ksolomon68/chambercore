import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { TierPricingForm } from "@/components/dues/TierPricingForm";
import { InvoiceRowActions } from "@/components/dues/InvoiceRowActions";
import type { MemberTier } from "@/lib/types/database.types";

export default async function DuesPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("dues_invoices")
    .select("id, member_id, description, amount, due_date, status, paid_at")
    .eq("org_id", org!.id)
    .order("due_date", { ascending: true });

  const memberIds = Array.from(
    new Set((invoices ?? []).map((i) => i.member_id)),
  );
  const { data: invoiceMembers } = memberIds.length
    ? await supabase
        .from("members")
        .select("id, business_name")
        .in("id", memberIds)
    : { data: [] };
  const memberById = new Map((invoiceMembers ?? []).map((m) => [m.id, m]));

  const { data: pricingRows } = await supabase
    .from("dues_tier_pricing")
    .select("tier, annual_price")
    .eq("org_id", org!.id);
  const priceByTier: Record<MemberTier, number | null> = {
    bronze: null,
    silver: null,
    gold: null,
  };
  (pricingRows ?? []).forEach((p) => {
    priceByTier[p.tier] = p.annual_price;
  });

  const { data: tierMembers } = await supabase
    .from("members")
    .select("tier")
    .eq("org_id", org!.id)
    .neq("status", "archived");
  const countByTier: Record<MemberTier, number> = {
    bronze: 0,
    silver: 0,
    gold: 0,
  };
  (tierMembers ?? []).forEach((m) => {
    countByTier[m.tier]++;
  });

  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const paidThisYear = (invoices ?? []).filter(
    (i) => i.status === "paid" && i.paid_at && new Date(i.paid_at) >= yearStart,
  );
  const collectedYTD = paidThisYear.reduce((sum, i) => sum + Number(i.amount), 0);

  const pending = (invoices ?? []).filter((i) => i.status === "pending");
  const outstandingTotal = pending.reduce((sum, i) => sum + Number(i.amount), 0);

  const overdue = pending.filter((i) => new Date(i.due_date) < today);
  const overdueTotal = overdue.reduce((sum, i) => sum + Number(i.amount), 0);

  const canEdit = canEditMembers(org?.role ?? null);
  const canVoid = canDeleteMembers(org?.role ?? null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            Dues &amp; Payments
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Track member dues invoices and payment status.
          </p>
        </div>
        {canEdit && <ButtonLink href="/dues/new">+ Create Invoice</ButtonLink>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Collected YTD"
          value={`$${collectedYTD.toLocaleString()}`}
        />
        <StatCard
          label="Outstanding"
          value={`$${outstandingTotal.toLocaleString()}`}
          hint={`${pending.length} invoice${pending.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Overdue"
          value={`$${overdueTotal.toLocaleString()}`}
          hint={`${overdue.length} account${overdue.length === 1 ? "" : "s"}`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold text-off-white">
            Outstanding Invoices
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pending.map((invoice) => {
                  const member = memberById.get(invoice.member_id);
                  const isOverdue = new Date(invoice.due_date) < today;
                  return (
                    <tr key={invoice.id} className="border-t border-card-border">
                      <td className="px-4 py-3 font-medium text-off-white">
                        {member?.business_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-off-white">
                        ${Number(invoice.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={isOverdue ? "danger" : "gold"}>
                          {isOverdue ? "Overdue" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceRowActions
                          invoiceId={invoice.id}
                          canEdit={canEdit}
                          canVoid={canVoid}
                        />
                      </td>
                    </tr>
                  );
                })}
                {pending.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-text-dim">
                      No outstanding invoices.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="mb-4 text-sm font-semibold text-off-white">
            Tier Pricing
          </div>
          <TierPricingForm
            prices={priceByTier}
            counts={countByTier}
            canEdit={org?.role === "owner" || org?.role === "admin"}
          />
        </Card>
      </div>
    </div>
  );
}
