import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ListingRow } from "@/components/directory/ListingRow";

export default async function DirectoryAdminPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, business_name, category, status")
    .eq("org_id", org!.id)
    .neq("status", "archived")
    .order("business_name", { ascending: true });

  const { data: listings } = await supabase
    .from("directory_listings")
    .select("*")
    .eq("org_id", org!.id);

  const listingByMemberId = new Map((listings ?? []).map((l) => [l.member_id, l]));

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
        {members?.map((m) => {
          const listing = listingByMemberId.get(m.id);
          if (!listing) return null;
          return (
            <ListingRow
              key={m.id}
              memberId={m.id}
              businessName={m.business_name}
              category={m.category}
              listing={listing}
            />
          );
        })}
        {(!members || members.length === 0) && (
          <p className="text-sm text-text-dim">
            No members yet. Add members first, then curate their directory
            listings here.
          </p>
        )}
      </div>
    </div>
  );
}
