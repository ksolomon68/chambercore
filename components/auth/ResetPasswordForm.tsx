"use client";

import { useActionState } from "react";
import { requestPasswordReset, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    requestPasswordReset,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {state !== undefined && !state.error && (
        <p className="text-sm text-green">
          If that email has an account, a reset link is on its way.
        </p>
      )}
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
