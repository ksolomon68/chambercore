"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createMeeting, type FormState } from "@/app/actions/meetings";

const MEETING_TYPES = [
  "Full Board Meeting",
  "Executive Committee",
  "Finance Committee",
  "Membership & Marketing",
  "Events Committee",
  "Advocacy Committee",
  "Special Session",
];

export function MeetingForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createMeeting,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Meeting Title
        </label>
        <input
          name="title"
          required
          placeholder="Finance Committee — Q3 Review"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Meeting Type
          </label>
          <select
            name="meetingType"
            defaultValue={MEETING_TYPES[0]}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            {MEETING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Format
          </label>
          <select
            name="format"
            defaultValue="in_person"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="in_person">In-Person</option>
            <option value="virtual">Virtual (Zoom)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Duration
          </label>
          <select
            name="durationMinutes"
            defaultValue="60"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">2 hours</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Location / Zoom Link
        </label>
        <input
          name="location"
          placeholder="Address or zoom.us/j/..."
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Agenda Items (one per line)
        </label>
        <textarea
          name="agenda"
          rows={6}
          placeholder={
            "1. Call to order\n2. Approval of prior minutes\n3. Treasurer's report\n4. Old business\n5. New business\n6. Adjournment"
          }
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Scheduling..." : "Schedule Meeting"}
      </Button>
    </form>
  );
}
