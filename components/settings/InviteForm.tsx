"use client";

import { useActionState } from "react";
import { inviteTeamMember, type FormState } from "@/app/actions/team";
import { Button } from "@/components/ui/Button";

export function InviteForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    inviteTeamMember,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="mb-8 flex flex-col gap-3 rounded-xl border border-card-border bg-card-bg p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="colleague@yourchamber.org"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Role
        </label>
        <select
          name="role"
          defaultValue="staff"
          className="rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Invite"}
      </Button>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-green">Invite sent.</p>}
    </form>
  );
}
