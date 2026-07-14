"use client";

import { useActionState, useState } from "react";
import { updateListing, type FormState } from "@/app/actions/directory";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Database } from "@/lib/types/database.types";

type Listing = Database["public"]["Tables"]["directory_listings"]["Row"];

export function ListingRow({
  memberId,
  businessName,
  category,
  listing,
}: {
  memberId: string;
  businessName: string;
  category: string | null;
  listing: Listing;
}) {
  const [expanded, setExpanded] = useState(false);
  const boundAction = updateListing.bind(null, memberId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    boundAction,
    undefined,
  );

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-off-white">{businessName}</div>
          <div className="text-xs text-text-dim">{category ?? "Uncategorized"}</div>
        </div>
        <div className="flex items-center gap-3">
          {listing.is_public ? (
            <Badge tone="green">Public</Badge>
          ) : (
            <Badge tone="muted">Hidden</Badge>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-xs text-gold hover:text-gold-light"
          >
            {expanded ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      {expanded && (
        <form action={formAction} className="mt-4 flex flex-col gap-3 border-t border-card-border pt-4">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              name="isPublic"
              defaultChecked={listing.is_public}
              className="accent-gold"
            />
            Show on public directory
          </label>
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={listing.featured}
              className="accent-gold"
            />
            Feature this listing
          </label>
          <textarea
            name="description"
            defaultValue={listing.description ?? ""}
            placeholder="Public description"
            rows={2}
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2 text-sm text-off-white outline-none focus:border-gold"
          />
          <input
            name="websiteUrl"
            defaultValue={listing.website_url ?? ""}
            placeholder="Website URL"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2 text-sm text-off-white outline-none focus:border-gold"
          />
          <input
            name="address"
            defaultValue={listing.address ?? ""}
            placeholder="Address"
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2 text-sm text-off-white outline-none focus:border-gold"
          />
          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          <Button type="submit" size="sm" disabled={pending} className="w-fit">
            {pending ? "Saving..." : "Save"}
          </Button>
        </form>
      )}
    </div>
  );
}
