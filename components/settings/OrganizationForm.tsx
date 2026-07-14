"use client";

import { useActionState } from "react";
import { updateOrganization, type FormState } from "@/app/actions/organization";
import { Button } from "@/components/ui/Button";

export function OrganizationForm({
  defaultName,
  defaultColor,
  canEdit,
}: {
  defaultName: string;
  defaultColor: string;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateOrganization,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Chamber Name
        </label>
        <input
          name="name"
          required
          disabled={!canEdit}
          defaultValue={defaultName}
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold disabled:opacity-50"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Brand Color
        </label>
        <input
          type="color"
          name="primaryColor"
          disabled={!canEdit}
          defaultValue={defaultColor}
          className="h-10 w-20 rounded-lg border border-card-border bg-navy disabled:opacity-50"
        />
      </div>

      {!canEdit && (
        <p className="text-xs text-text-dim">
          Only owners and admins can edit organization settings.
        </p>
      )}
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-green">Saved.</p>}

      {canEdit && (
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      )}
    </form>
  );
}
