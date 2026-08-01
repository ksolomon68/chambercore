"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createEvent, type FormState } from "@/app/actions/events";

export function EventForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createEvent,
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
          placeholder="Business After Hours Mixer"
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
          Location
        </label>
        <input
          name="location"
          placeholder="Riverside Country Club"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Date &amp; Time
        </label>
        <input
          type="datetime-local"
          name="startsAt"
          required
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Price (leave blank if free)
          </label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Capacity (optional)
          </label>
          <input
            type="number"
            name="capacity"
            min="1"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creating..." : "Create Event"}
      </Button>
    </form>
  );
}
