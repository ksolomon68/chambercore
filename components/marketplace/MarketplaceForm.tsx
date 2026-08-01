"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/app/actions/marketplace";
import type { MarketplaceKind } from "@/lib/types/database.types";

export function MarketplaceForm({
  action,
  members,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  members?: { id: string; business_name: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined,
  );
  const [kind, setKind] = useState<MarketplaceKind>("deal");

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {members && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Business
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
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setKind("deal")}
          className={`rounded-lg border-2 p-3 text-center transition-colors ${
            kind === "deal"
              ? "border-gold bg-gold/10"
              : "border-card-border bg-navy hover:border-gold/40"
          }`}
        >
          <div className="text-xl">🏷️</div>
          <div className="text-sm font-semibold text-off-white">
            Member Deal
          </div>
          <div className="text-xs text-text-dim">Offer a discount</div>
        </button>
        <button
          type="button"
          onClick={() => setKind("job")}
          className={`rounded-lg border-2 p-3 text-center transition-colors ${
            kind === "job"
              ? "border-gold bg-gold/10"
              : "border-card-border bg-navy hover:border-gold/40"
          }`}
        >
          <div className="text-xl">💼</div>
          <div className="text-sm font-semibold text-off-white">
            Job Opening
          </div>
          <div className="text-xs text-text-dim">Post a position</div>
        </button>
      </div>
      <input type="hidden" name="kind" value={kind} />

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          {kind === "deal" ? "Offer Headline" : "Job Title"}
        </label>
        <input
          name="title"
          required
          placeholder={
            kind === "deal" ? "20% Off All Arrangements" : "Marketing Coordinator"
          }
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Category
        </label>
        <input
          name="category"
          placeholder="Food & Beverage, Retail, Legal..."
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {kind === "deal" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Discount / Value
            </label>
            <input
              name="discountLabel"
              placeholder="20% OFF, FREE"
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Promo Code
            </label>
            <input
              name="promoCode"
              placeholder="BLOOM20"
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              name="expiresAt"
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Employment Type
            </label>
            <select
              name="employmentType"
              defaultValue="full_time"
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            >
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Pay Range
            </label>
            <input
              name="payRange"
              placeholder="$45k–$55k"
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-text-muted">
              Location
            </label>
            <input
              name="location"
              placeholder="City, TX or Remote"
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          </div>
        </div>
      )}

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Submitting..." : kind === "deal" ? "Post Deal" : "Post Job"}
      </Button>
    </form>
  );
}
