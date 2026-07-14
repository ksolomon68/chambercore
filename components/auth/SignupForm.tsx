"use client";

import { useActionState } from "react";
import { signup, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function SignupForm({ planTier }: { planTier: "starter" | "professional" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    signup,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="planTier" value={planTier} />

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Chamber Name
        </label>
        <input
          name="chamberName"
          required
          placeholder="Harbor Chamber of Commerce"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Work Email
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@yourchamber.org"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Creating your chamber..." : "Create Chamber Account"}
      </Button>
    </form>
  );
}
