"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { uploadDocument, type FormState } from "@/app/actions/documents";

export function DocumentForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    uploadDocument,
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
          placeholder="Bylaws — Revised 2026"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          Category
        </label>
        <select
          name="category"
          defaultValue="other"
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
        >
          <option value="governing">Governing</option>
          <option value="minutes">Minutes</option>
          <option value="financial">Financial</option>
          <option value="policies">Policies</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-text-muted">
          File
        </label>
        <input
          type="file"
          name="file"
          required
          className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy"
        />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
