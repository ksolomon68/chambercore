"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { updateTierPricing, type FormState } from "@/app/actions/dues";

const TIERS = [
  { key: "bronze", label: "Bronze", icon: "🥉" },
  { key: "silver", label: "Silver", icon: "🥈" },
  { key: "gold", label: "Gold", icon: "🥇" },
] as const;

export function TierPricingForm({
  prices,
  counts,
  canEdit,
}: {
  prices: Record<"bronze" | "silver" | "gold", number | null>;
  counts: Record<"bronze" | "silver" | "gold", number>;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateTierPricing,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {TIERS.map((tier) => (
        <div key={tier.key} className="flex items-center gap-3">
          <span className="text-lg">{tier.icon}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-off-white">
              {tier.label} Membership
            </div>
            <div className="text-xs text-text-dim">
              {counts[tier.key]} member{counts[tier.key] === 1 ? "" : "s"}
            </div>
          </div>
          {canEdit ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-text-muted">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name={tier.key}
                defaultValue={prices[tier.key] ?? ""}
                placeholder="Not set"
                className="w-24 rounded-lg border border-card-border bg-navy px-2 py-1.5 text-sm text-off-white outline-none focus:border-gold"
              />
              <span className="text-xs text-text-dim">/yr</span>
            </div>
          ) : (
            <div className="text-sm text-off-white">
              {prices[tier.key] != null ? `$${prices[tier.key]}/yr` : "Not set"}
            </div>
          )}
        </div>
      ))}
      {canEdit && (
        <div className="mt-1 flex items-center gap-3">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving..." : "Save Pricing"}
          </Button>
          {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
          {state?.success && <p className="text-xs text-green">Saved.</p>}
        </div>
      )}
    </form>
  );
}
