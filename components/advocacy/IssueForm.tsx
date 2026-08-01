"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createIssue, type FormState } from "@/app/actions/advocacy";

export function IssueForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createIssue,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Issue Title
        </label>
        <input
          name="title"
          required
          placeholder="Proposed Downtown Parking Fee Increase"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Status
          </label>
          <select
            name="status"
            defaultValue="monitoring"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="urgent">Urgent</option>
            <option value="watch">Watch</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Action Goal (contacts)
          </label>
          <input
            type="number"
            name="goalCount"
            min="0"
            placeholder="100"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Chamber Position (adopted stance)
        </label>
        <textarea
          name="position"
          rows={2}
          placeholder="The Chamber opposes the proposed fee increase as written..."
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="border-t border-card-border pt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
          Call to Action (shown to members)
        </div>
        <div className="flex flex-col gap-3">
          <input
            name="ctaHeadline"
            placeholder="Tell City Council to reconsider this increase"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
          <input
            name="ctaEmailSubject"
            placeholder="Email subject: Please reconsider the parking fee increase"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
          <textarea
            name="ctaEmailBody"
            rows={4}
            placeholder="Dear Council Member, as a local business owner I'm writing to..."
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creating..." : "Create Issue"}
      </Button>
    </form>
  );
}
