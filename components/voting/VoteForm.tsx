"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createVote, type FormState } from "@/app/actions/voting";

export function VoteForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createVote,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Title
        </label>
        <input
          name="title"
          required
          placeholder="Approve FY2027 Annual Operating Budget"
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

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Options (at least 2)
        </label>
        <div className="flex flex-col gap-2">
          {["Yes — Approve", "No — Reject", "Abstain", ""].map((placeholder, i) => (
            <input
              key={i}
              name="option"
              placeholder={placeholder || "Additional option (optional)"}
              defaultValue={i < 2 ? placeholder : ""}
              className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Closes (optional)
        </label>
        <input
          type="datetime-local"
          name="closesAt"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creating..." : "Create Vote"}
      </Button>
    </form>
  );
}
