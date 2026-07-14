"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function BillingActions({
  orgId,
  hasCustomer,
  canUpgrade,
}: {
  orgId: string;
  hasCustomer: boolean;
  canUpgrade: "starter" | "professional" | null;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function goToPortal() {
    setPending("portal");
    setError(null);
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      body: JSON.stringify({ orgId }),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error);
      setPending(null);
      return;
    }
    window.location.href = body.url;
  }

  async function upgrade(tier: string) {
    setPending(tier);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ orgId, tier }),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error);
      setPending(null);
      return;
    }
    window.location.href = body.url;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {hasCustomer && (
          <Button
            variant="outline"
            onClick={goToPortal}
            disabled={pending !== null}
          >
            {pending === "portal" ? "Opening..." : "Manage Billing"}
          </Button>
        )}
        {canUpgrade && (
          <Button onClick={() => upgrade(canUpgrade)} disabled={pending !== null}>
            {pending === canUpgrade
              ? "Redirecting..."
              : `Upgrade to ${canUpgrade === "professional" ? "Professional" : "Starter"}`}
          </Button>
        )}
      </div>
    </div>
  );
}
