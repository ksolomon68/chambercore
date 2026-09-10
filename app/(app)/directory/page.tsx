import { getCurrentOrg } from "@/lib/auth/session";
import { query } from "@/lib/db/mysql";
import { ListingRow } from "@/components/directory/ListingRow";

export default async function DirectoryAdminPage() {
  const org = await getCurrentOrg();

  const rows = await query<{
    id: string;
    business_name: string;
    category: string | null;
    listing_id: string | null;
    is_public: number | boolean;
    featured: number | boolean;
    description: string | null;
    website_url: string | null;
    address: string | null;
    logo_url: string | null;
  }>(
    `SELECT m.id, m.business_name, m.category,
            dl.id as listing_id, dl.is_public, dl.featured, dl.description,
            dl.website_url, dl.address, dl.logo_url
     FROM members m
     LEFT JOIN directory_listings dl ON dl.member_id = m.id AND dl.org_id = m.org_id
     WHERE m.org_id = ? AND m.status != 'archived'
     ORDER BY m.business_name ASC`,
    [org!.id]
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Business Directory
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Choose which members appear on your chamber&apos;s public directory at{" "}
        <code className="text-gold-light">/c/{org?.slug}</code>.
      </p>

      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const listing = {
            id: row.listing_id || row.id,
            org_id: org!.id,
            member_id: row.id,
            is_public: Boolean(row.is_public),
            featured: Boolean(row.featured),
            description: row.description,
            website_url: row.website_url,
            address: row.address,
            logo_url: row.logo_url,
            updated_at: new Date().toISOString(),
          };

          return (
            <ListingRow
              key={row.id}
              memberId={row.id}
              businessName={row.business_name}
              category={row.category}
              listing={listing}
            />
          );
        })}
        {rows.length === 0 && (
          <p className="text-sm text-text-dim">
            No members yet. Add members first, then curate their directory
            listings here.
          </p>
        )}
      </div>
    </div>
  );
}
