"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createCommittee, type FormState } from "@/app/actions/committees";

export function CommitteeForm({
  boardMembers,
}: {
  boardMembers: { id: string; name: string; title: string | null }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createCommittee,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Committee Name
        </label>
        <input
          name="name"
          required
          placeholder="Finance Committee"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Description
        </label>
        <textarea
          name="description"
          rows={2}
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Type
          </label>
          <select
            name="committeeType"
            defaultValue="committee"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="executive">Executive</option>
            <option value="finance">Finance</option>
            <option value="committee">Committee</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Chair
          </label>
          <select
            name="chairBoardMemberId"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="">None</option>
            {boardMembers.map((bm) => (
              <option key={bm.id} value={bm.id}>
                {bm.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Next Meeting (optional)
        </label>
        <input
          type="datetime-local"
          name="nextMeetingAt"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Members
        </label>
        <div className="flex flex-col gap-1.5 rounded-lg border border-card-border bg-navy p-3">
          {boardMembers.length === 0 && (
            <p className="text-xs text-text-dim">
              No board members yet — add some to the roster first.
            </p>
          )}
          {boardMembers.map((bm) => (
            <label key={bm.id} className="flex items-center gap-2 text-sm text-off-white">
              <input
                type="checkbox"
                name="boardMemberIds"
                value={bm.id}
                className="accent-gold"
              />
              {bm.name}
              {bm.title && <span className="text-xs text-text-dim">— {bm.title}</span>}
            </label>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Creating..." : "Create Committee"}
      </Button>
    </form>
  );
}
