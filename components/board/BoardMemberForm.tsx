"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createBoardMember, type FormState } from "@/app/actions/board";

export function BoardMemberForm({
  members,
}: {
  members: { id: string; business_name: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createBoardMember,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Name
        </label>
        <input
          name="name"
          required
          placeholder="Robert Williams"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Title
          </label>
          <input
            name="title"
            placeholder="President, Treasurer, Board Member..."
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Business Affiliation
          </label>
          <select
            name="memberId"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          >
            <option value="">None</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.business_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input type="checkbox" name="isExecutive" className="accent-gold" />
        Executive committee member
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Adding..." : "Add to Roster"}
      </Button>
    </form>
  );
}
