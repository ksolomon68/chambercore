import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { MarketplaceForm } from "@/components/marketplace/MarketplaceForm";
import { createListing } from "@/app/actions/marketplace";

export default async function NewListingPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, business_name")
    .eq("org_id", org!.id)
    .neq("status", "archived")
    .order("business_name", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Post to Marketplace
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Staff-posted listings go live immediately.
      </p>
      <MarketplaceForm action={createListing} members={members ?? []} />
    </div>
  );
}
