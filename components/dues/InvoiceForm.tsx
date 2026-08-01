"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createInvoice, type FormState } from "@/app/actions/dues";

export function InvoiceForm({
  members,
}: {
  members: { id: string; business_name: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createInvoice,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Member
        </label>
        <select
          name="memberId"
          required
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        >
          <option value="">Select a member...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.business_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Description
        </label>
        <input
          name="description"
          required
          placeholder="Bronze Membership — Annual"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            required
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            required
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creating..." : "Create Invoice"}
      </Button>
    </form>
  );
}
