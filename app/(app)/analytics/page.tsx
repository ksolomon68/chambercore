import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default async function AnalyticsPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    { data: members },
    { data: registrations },
    { data: rsvps },
    { data: paidInvoices },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("id, business_name, category, status, member_since")
      .eq("org_id", org!.id),
    supabase
      .from("event_registrations")
      .select("member_id, registered_at")
      .eq("org_id", org!.id),
    supabase
      .from("meeting_rsvps")
      .select("member_id, responded_at")
      .eq("org_id", org!.id),
    supabase
      .from("dues_invoices")
      .select("amount, paid_at")
      .eq("org_id", org!.id)
      .eq("status", "paid"),
  ]);

  const allMembers = members ?? [];
  const activeMembers = allMembers.filter((m) => m.status === "active");
  const lapsedMembers = allMembers.filter((m) => m.status === "lapsed");

  const retentionRate =
    activeMembers.length + lapsedMembers.length > 0
      ? Math.round(
          (activeMembers.length / (activeMembers.length + lapsedMembers.length)) * 100,
        )
      : null;

  const newMembersYtd = allMembers.filter(
    (m) => new Date(m.member_since) >= yearStart,
  ).length;

  const collectedYtd = (paidInvoices ?? [])
    .filter((i) => i.paid_at && new Date(i.paid_at) >= yearStart)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  // Last-activity date per member, from either event registrations or
  // meeting RSVPs — whichever is more recent.
  const lastActivityByMember = new Map<string, Date>();
  (registrations ?? []).forEach((r) => {
    const d = new Date(r.registered_at);
    const existing = lastActivityByMember.get(r.member_id);
    if (!existing || d > existing) lastActivityByMember.set(r.member_id, d);
  });
  (rsvps ?? []).forEach((r) => {
    const d = new Date(r.responded_at);
    const existing = lastActivityByMember.get(r.member_id);
    if (!existing || d > existing) lastActivityByMember.set(r.member_id, d);
  });

  const totalActivityCount = (registrations?.length ?? 0) + (rsvps?.length ?? 0);
  const avgEngagement =
    activeMembers.length > 0
      ? (totalActivityCount / activeMembers.length).toFixed(1)
      : "0.0";

  // Engagement by category: % of that category's members with ≥1 activity.
  const categoryMap = new Map<string, { total: number; engaged: number }>();
  allMembers.forEach((m) => {
    const category = m.category?.trim() || "Uncategorized";
    const bucket = categoryMap.get(category) ?? { total: 0, engaged: 0 };
    bucket.total++;
    if (lastActivityByMember.has(m.id)) bucket.engaged++;
    categoryMap.set(category, bucket);
  });
  const engagementByCategory = Array.from(categoryMap.entries())
    .map(([category, { total, engaged }]) => ({
      category,
      pct: total > 0 ? Math.round((engaged / total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  // Membership growth: cumulative count by member_since month, this year.
  const monthCounts = new Array(now.getMonth() + 1).fill(0);
  allMembers.forEach((m) => {
    const d = new Date(m.member_since);
    if (d >= yearStart && d.getMonth() <= now.getMonth()) {
      monthCounts[d.getMonth()]++;
    }
  });
  const membershipGrowth = monthCounts.map((_, i) => ({
    month: MONTH_NAMES[i],
    count: monthCounts.slice(0, i + 1).reduce((sum, c) => sum + c, 0),
  }));
  const growthMax = Math.max(1, ...membershipGrowth.map((m) => m.count));

  // At-risk: active members with no activity in 90+ days (or ever).
  const atRisk = activeMembers
    .map((m) => {
      const last = lastActivityByMember.get(m.id);
      const baseline = last ?? new Date(m.member_since);
      const daysSince = Math.floor(
        (now.getTime() - baseline.getTime()) / (1000 * 60 * 60 * 24),
      );
      return { ...m, lastActivity: last ?? null, daysSince };
    })
    .filter((m) => m.daysSince >= 90)
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 10);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Analytics
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Membership health, engagement, and revenue at a glance.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Retention Rate"
          value={retentionRate != null ? `${retentionRate}%` : "—"}
        />
        <StatCard label="Avg Engagement" value={avgEngagement} hint="activities/member" />
        <StatCard label="New Members YTD" value={newMembersYtd} />
        <StatCard label="Dues Collected YTD" value={`$${collectedYtd.toLocaleString()}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 text-sm font-semibold text-off-white">
            Membership Growth {now.getFullYear()}
          </div>
          <div className="flex flex-col gap-2">
            {membershipGrowth.map((m) => (
              <div key={m.month} className="flex items-center gap-3 text-xs">
                <div className="w-8 shrink-0 text-text-muted">{m.month}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${(m.count / growthMax) * 100}%` }}
                  />
                </div>
                <div className="w-8 shrink-0 text-right text-text-dim">{m.count}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold text-off-white">
            Engagement by Category
          </div>
          <div className="flex flex-col gap-2">
            {engagementByCategory.map((c) => (
              <div key={c.category} className="flex items-center gap-3 text-xs">
                <div className="w-28 shrink-0 truncate text-text-muted">
                  {c.category}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <div className="w-9 shrink-0 text-right text-text-dim">{c.pct}%</div>
              </div>
            ))}
            {engagementByCategory.length === 0 && (
              <p className="text-xs text-text-dim">No members yet.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6 !p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold text-off-white">
          At-Risk Members — No Activity 90+ Days
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Last Activity</th>
                <th className="px-4 py-3">Days Inactive</th>
                <th className="px-4 py-3">Risk</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((m) => (
                <tr key={m.id} className="border-t border-card-border">
                  <td className="px-4 py-3 font-medium text-off-white">
                    {m.business_name}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {m.lastActivity
                      ? m.lastActivity.toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{m.daysSince}</td>
                  <td className="px-4 py-3">
                    <Badge tone={m.daysSince >= 180 ? "danger" : "gold"}>
                      {m.daysSince >= 180 ? "High" : "Medium"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {atRisk.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-text-dim">
                    No at-risk members right now.
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
