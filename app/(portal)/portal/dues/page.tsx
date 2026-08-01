import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TierBadge } from "@/components/members/TierBadge";

export default async function PortalDuesPage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: pricing } = await supabase
    .from("dues_tier_pricing")
    .select("annual_price")
    .eq("org_id", member.orgId)
    .eq("tier", member.tier)
    .maybeSingle();

  const { data: invoices } = await supabase
    .from("dues_invoices")
    .select("id, description, amount, due_date, status")
    .eq("member_id", member.id)
    .neq("status", "void")
    .order("due_date", { ascending: false });

  const today = new Date();
  const outstanding = (invoices ?? []).filter((i) => i.status === "pending");
  const outstandingTotal = outstanding.reduce(
    (sum, i) => sum + Number(i.amount),
    0,
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Dues &amp; Billing
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Your membership plan and dues payment history.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-display text-xl font-bold text-off-white capitalize">
              {member.tier} Membership
            </div>
            <TierBadge tier={member.tier} />
          </div>
          <div className="text-sm text-text-muted">
            {pricing?.annual_price != null
              ? `$${Number(pricing.annual_price).toLocaleString()} / year`
              : "Annual price not set by your chamber yet."}
          </div>
          {outstanding.length > 0 ? (
            <div className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              You have {outstanding.length} outstanding invoice
              {outstanding.length === 1 ? "" : "s"} totaling $
              {outstandingTotal.toLocaleString()}. Contact your chamber to pay.
            </div>
          ) : (
            <div className="mt-4 text-sm text-green">No outstanding balance.</div>
          )}
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold text-off-white">
            Payment History
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(invoices ?? []).map((invoice) => {
                  const isOverdue =
                    invoice.status === "pending" &&
                    new Date(invoice.due_date) < today;
                  return (
                    <tr key={invoice.id} className="border-t border-card-border">
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-off-white">
                        {invoice.description}
                      </td>
                      <td className="px-4 py-3 text-off-white">
                        ${Number(invoice.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            invoice.status === "paid"
                              ? "green"
                              : isOverdue
                                ? "danger"
                                : "gold"
                          }
                        >
                          {invoice.status === "paid"
                            ? "Paid"
                            : isOverdue
                              ? "Overdue"
                              : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {(!invoices || invoices.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-text-dim">
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
