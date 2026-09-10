import { requireMember } from "@/lib/auth/session";
import { query, queryOne } from "@/lib/db/mysql";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TierBadge } from "@/components/members/TierBadge";

export default async function PortalDuesPage() {
  const member = await requireMember();

  const pricing = await queryOne<{ annual_price: number }>(
    "SELECT annual_price FROM dues_tier_pricing WHERE org_id = ? AND tier = ?",
    [member.orgId, member.tier]
  );

  const invoices = await query<{
    id: string;
    description: string;
    amount: number;
    due_date: string | Date;
    status: "pending" | "paid" | "void";
  }>(
    `SELECT id, description, amount, due_date, status
     FROM dues_invoices
     WHERE member_id = ? AND status != 'void'
     ORDER BY due_date DESC`,
    [member.id]
  );

  const today = new Date();
  const outstanding = invoices.filter((i) => i.status === "pending");
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
                {invoices.map((invoice) => {
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
                {invoices.length === 0 && (
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
