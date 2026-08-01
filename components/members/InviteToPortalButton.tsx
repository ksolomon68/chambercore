"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { inviteMemberToPortal, type FormState } from "@/app/actions/members";

export function InviteToPortalButton({ memberId }: { memberId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    inviteMemberToPortal.bind(null, memberId),
    undefined,
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Sending..." : "Invite to Portal"}
      </Button>
      {state?.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="mt-2 text-xs text-green">Invite sent.</p>
      )}
    </form>
  );
}
