import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DirectoryCard } from "@/components/directory/DirectoryCard";

export default async function PublicDirectoryPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("public_org_profile")
    .select("id, name, slug, logo_url, primary_color")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  // Public listings only expose directory_listings + business_name/category
  // (via a second lookup) — never members.email/phone/notes, which have no
  // anon-accessible RLS policy.
  const { data: listings } = await supabase
    .from("directory_listings")
    .select("id, member_id, description, website_url, address, logo_url, featured")
    .eq("org_id", org.id)
    .eq("is_public", true);

  const memberIds = (listings ?? []).map((l) => l.member_id);
  const { data: members } = memberIds.length
    ? await supabase
        .from("members")
        .select("id, business_name, category")
        .in("id", memberIds)
    : { data: [] };

  const memberById = new Map((members ?? []).map((m) => [m.id, m]));

  const cards = (listings ?? [])
    .map((listing) => {
      const member = memberById.get(listing.member_id);
      if (!member) return null;
      return { listing, member };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) =>
      a.listing.featured === b.listing.featured
        ? a.member.business_name.localeCompare(b.member.business_name)
        : a.listing.featured
          ? -1
          : 1,
    );

  return (
    <div className="min-h-screen bg-navy px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="font-display text-3xl font-bold text-off-white">
            {org.name} Business Directory
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {cards.length} business{cards.length === 1 ? "" : "es"} in this
            chamber
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ listing, member }) => (
            <DirectoryCard
              key={listing.id}
              businessName={member.business_name}
              category={member.category}
              description={listing.description}
              websiteUrl={listing.website_url}
              address={listing.address}
              featured={listing.featured}
            />
          ))}
          {cards.length === 0 && (
            <p className="col-span-full text-center text-text-dim">
              No public listings yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
