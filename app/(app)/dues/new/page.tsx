import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { InvoiceForm } from "@/components/dues/InvoiceForm";

export default async function NewInvoicePage() {
  const org = await getCurrentOrg();

  const members = await query<{ id: string; business_name: string }>(
    "SELECT id, business_name FROM members WHERE org_id = ? AND status != 'archived' ORDER BY business_name ASC",
    [org!.id]
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Create Invoice
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Bill a member for dues, and mark it paid once you&apos;ve received
        payment.
      </p>
      <InvoiceForm members={members} />
    </div>
  );
}
