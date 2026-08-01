import Link from "next/link";
import { requireMember } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

export default async function PortalMarketplacePage() {
  const member = await requireMember();
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select(
      "id, member_id, kind, title, category, description, discount_label, promo_code, expires_at, employment_type, location, pay_range, status",
    )
    .eq("org_id", member.orgId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const memberIds = Array.from(new Set((listings ?? []).map((l) => l.member_id)));
  const { data: members } = memberIds.length
    ? await supabase.from("members").select("id, business_name").in("id", memberIds)
    : { data: [] };
  const memberById = new Map((members ?? []).map((m) => [m.id, m]));

  const deals = (listings ?? []).filter((l) => l.kind === "deal");
  const jobs = (listings ?? []).filter((l) => l.kind === "job");

  const EMPLOYMENT_LABEL: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
    internship: "Internship",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">
            M2M Marketplace
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Exclusive deals and job opportunities from fellow members.
          </p>
        </div>
        <ButtonLink href="/portal/marketplace/new">+ Submit a Listing</ButtonLink>
      </div>

      <Tabs
        tabs={[
          {
            label: `🏷️ Member Deals (${deals.length})`,
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                {deals.map((deal) => (
                  <Card key={deal.id}>
                    <div className="flex items-start justify-between">
                      <div className="font-display text-lg font-bold text-gold-light">
                        {deal.discount_label ?? "Offer"}
                      </div>
                      {deal.category && <Badge tone="muted">{deal.category}</Badge>}
                    </div>
                    <div className="mt-1 font-semibold text-off-white">
                      {deal.title}
                    </div>
                    <div className="text-xs text-text-dim">
                      {memberById.get(deal.member_id)?.business_name}
                    </div>
                    {deal.description && (
                      <p className="mt-2 text-sm text-text-muted">
                        {deal.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-card-border pt-3 text-xs">
                      <span className="text-text-dim">
                        {deal.expires_at
                          ? `Expires ${new Date(deal.expires_at).toLocaleDateString()}`
                          : "Ongoing"}
                      </span>
                      {deal.promo_code && (
                        <span className="rounded-md bg-gold/10 px-2 py-1 font-mono font-bold text-gold-light">
                          {deal.promo_code}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
                {deals.length === 0 && (
                  <p className="text-sm text-text-dim">No active deals yet.</p>
                )}
              </div>
            ),
          },
          {
            label: `💼 Job Board (${jobs.length})`,
            content: (
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <Card key={job.id} className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-off-white">
                        {job.title}
                      </div>
                      <div className="text-xs text-text-dim">
                        {memberById.get(job.member_id)?.business_name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                        {job.employment_type && (
                          <Badge tone="teal">
                            {EMPLOYMENT_LABEL[job.employment_type]}
                          </Badge>
                        )}
                        {job.location && <span>📍 {job.location}</span>}
                        {job.pay_range && <span>{job.pay_range}</span>}
                      </div>
                      {job.description && (
                        <p className="mt-2 text-sm text-text-muted">
                          {job.description}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {jobs.length === 0 && (
                  <p className="text-sm text-text-dim">No open positions yet.</p>
                )}
              </div>
            ),
          },
        ]}
      />

      <p className="mt-6 text-xs text-text-dim">
        Submitted listings are reviewed by chamber staff before going live.{" "}
        <Link href="/portal/marketplace/new" className="text-gold hover:text-gold-light">
          Submit one now
        </Link>
        .
      </p>
    </div>
  );
}
