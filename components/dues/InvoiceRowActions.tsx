"use client";

import { markInvoicePaid, voidInvoice } from "@/app/actions/dues";
import { Button } from "@/components/ui/Button";

export function InvoiceRowActions({
  invoiceId,
  canEdit,
  canVoid,
}: {
  invoiceId: string;
  canEdit: boolean;
  canVoid: boolean;
}) {
  if (!canEdit) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <form
        action={markInvoicePaid.bind(null, invoiceId)}
        className="flex items-center gap-1"
      >
        <select
          name="method"
          defaultValue="check"
          className="rounded-md border border-card-border bg-navy px-1.5 py-1 text-xs text-off-white outline-none focus:border-gold"
        >
          <option value="cash">Cash</option>
          <option value="check">Check</option>
          <option value="card">Card</option>
          <option value="ach">ACH</option>
          <option value="other">Other</option>
        </select>
        <Button type="submit" variant="outline" size="sm" className="!px-2 !py-1 text-xs">
          Mark Paid
        </Button>
      </form>
      {canVoid && (
        <form action={voidInvoice.bind(null, invoiceId)}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="!px-0 text-xs text-text-dim hover:text-red-400"
          >
            Void
          </Button>
        </form>
      )}
    </div>
  );
}
