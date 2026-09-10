import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db/mysql";
import { DirectoryCard } from "@/components/directory/DirectoryCard";

export default async function PublicDirectoryPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  const org = await queryOne<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
  }>("SELECT id, name, slug, logo_url, primary_color FROM organizations WHERE slug = ?", [
    orgSlug,
  ]);

  if (!org) notFound();

  const listings = await query<{
    id: string;
    member_id: string;
    description: string | null;
    website_url: string | null;
    address: string | null;
    logo_url: string | null;
    featured: number | boolean;
    business_name: string;
    category: string | null;
  }>(
    `SELECT dl.id, dl.member_id, dl.description, dl.website_url, dl.address, dl.logo_url, dl.featured,
            m.business_name, m.category
     FROM directory_listings dl
     INNER JOIN members m ON m.id = dl.member_id
     WHERE dl.org_id = ? AND dl.is_public = 1
     ORDER BY dl.featured DESC, m.business_name ASC`,
    [org.id]
  );

  return (
    <div className="min-h-screen bg-navy px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-bold text-off-white">
            {org.name} Business Directory
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {listings.length} business{listings.length === 1 ? "" : "es"} in this
            chamber
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <DirectoryCard
              key={l.id}
              businessName={l.business_name}
              category={l.category}
              description={l.description}
              websiteUrl={l.website_url}
              address={l.address}
              featured={Boolean(l.featured)}
            />
          ))}
          {listings.length === 0 && (
            <p className="col-span-full text-center text-text-dim">
              No public listings yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
