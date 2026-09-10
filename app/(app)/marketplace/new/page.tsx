import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { MarketplaceForm } from "@/components/marketplace/MarketplaceForm";
import { createListing } from "@/app/actions/marketplace";

export default async function NewListingPage() {
  const org = await getCurrentOrg();

  const members = await query<{ id: string; business_name: string }>(
    "SELECT id, business_name FROM members WHERE org_id = ? AND status != 'archived' ORDER BY business_name ASC",
    [org!.id]
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Post to Marketplace
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Staff-posted listings go live immediately.
      </p>
      <MarketplaceForm action={createListing} members={members} />
    </div>
  );
}
