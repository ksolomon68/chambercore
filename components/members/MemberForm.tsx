"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/app/actions/members";
import type { Database } from "@/lib/types/database.types";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];

export function MemberForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: Partial<MemberRow>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-xl">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Business Name
        </label>
        <input
          name="businessName"
          required
          defaultValue={defaultValues?.business_name}
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Contact Name
          </label>
          <input
            name="contactName"
            defaultValue={defaultValues?.contact_name ?? ""}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Category
          </label>
          <input
            name="category"
            defaultValue={defaultValues?.category ?? ""}
            placeholder="Retail, Legal, Food & Beverage..."
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Email
          </label>
          <input
            type="email"
            name="email"
            defaultValue={defaultValues?.email ?? ""}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Phone
          </label>
          <input
            name="phone"
            defaultValue={defaultValues?.phone ?? ""}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Tier
          </label>
          <select
            name="tier"
            defaultValue={defaultValues?.tier ?? "bronze"}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Status
          </label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "active"}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="lapsed">Lapsed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ""}
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
