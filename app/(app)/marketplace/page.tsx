import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { canEditMembers, canDeleteMembers } from "@/lib/auth/permissions";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { ListingRowActions } from "@/components/marketplace/ListingRowActions";

export default async function MarketplacePage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select(
      "id, member_id, kind, title, category, status, discount_label, employment_type",
    )
    .eq("org_id", org!.id)
    .order("created_at", { ascending: false });

  const memberIds = Array.from(new Set((listings ?? []).map((l) => l.member_id)));
  const { data: members } = memberIds.length
    ? await supabase.from("members").select("id, business_name").in("id", memberIds)
    : { data: [] };
  const memberById = new Map((members ?? []).map((m) => [m.id, m]));

  const pending = (listings ?? []).filter((l) => l.status === "pending");
  const active = (listings ?? []).filter((l) => l.status === "approved");
  const activeDeals = active.filter((l) => l.kind === "deal");
  const activeJobs = active.filter((l) => l.kind === "job");

  const canEdit = canEditMembers(org?.role ?? null);
  const canArchive = canDeleteMembers(org?.role ?? null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            M2M Marketplace
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Member deals and job postings, visible to active members only.
          </p>
        </div>
        <ButtonLink href="/marketplace/new">+ Post Listing</ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Deals" value={activeDeals.length} />
        <StatCard label="Open Positions" value={activeJobs.length} />
        <StatCard label="Pending Review" value={pending.length} />
      </div>

      {pending.length > 0 && (
        <Card className="mt-6 !p-0 overflow-hidden">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold text-off-white">
            Pending Review
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pending.map((listing) => (
                  <tr key={listing.id} className="border-t border-card-border">
                    <td className="px-4 py-3 font-medium text-off-white">
                      {memberById.get(listing.member_id)?.business_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={listing.kind === "deal" ? "gold" : "teal"}>
                        {listing.kind === "deal" ? "Deal" : "Job"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{listing.title}</td>
                    <td className="px-4 py-3">
                      <ListingRowActions
                        listingId={listing.id}
                        status={listing.status}
                        canEdit={canEdit}
                        canArchive={canArchive}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="mt-6 !p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold text-off-white">
          Active Listings
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {active.map((listing) => (
                <tr key={listing.id} className="border-t border-card-border">
                  <td className="px-4 py-3 font-medium text-off-white">
                    {memberById.get(listing.member_id)?.business_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={listing.kind === "deal" ? "gold" : "teal"}>
                      {listing.kind === "deal" ? "Deal" : "Job"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{listing.title}</td>
                  <td className="px-4 py-3">
                    <ListingRowActions
                      listingId={listing.id}
                      status={listing.status}
                      canEdit={canEdit}
                      canArchive={canArchive}
                    />
                  </td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-text-dim">
                    No active listings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
