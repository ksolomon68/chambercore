"use client";

import { approveListing, archiveListing } from "@/app/actions/marketplace";
import { Button } from "@/components/ui/Button";

export function ListingRowActions({
  listingId,
  status,
  canEdit,
  canArchive,
}: {
  listingId: string;
  status: string;
  canEdit: boolean;
  canArchive: boolean;
}) {
  if (!canEdit) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "pending" && (
        <form action={approveListing.bind(null, listingId)}>
          <Button type="submit" variant="outline" size="sm">
            Approve
          </Button>
        </form>
      )}
      {canArchive && status !== "archived" && (
        <form action={archiveListing.bind(null, listingId)}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="!px-0 text-xs text-text-dim hover:text-red-400"
          >
            Archive
          </Button>
        </form>
      )}
    </div>
  );
}
