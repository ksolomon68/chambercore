"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    login,
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

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Signing in..." : "Log In"}
      </Button>
    </form>
  );
}
