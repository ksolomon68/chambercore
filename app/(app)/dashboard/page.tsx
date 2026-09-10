import { getCurrentOrg } from "@/lib/auth/session";
import { queryOne } from "@/lib/db/mysql";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const org = await getCurrentOrg();

  const counts = await queryOne<{
    active_count: number;
    pending_count: number;
    lapsed_count: number;
  }>(
    `SELECT
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
       SUM(CASE WHEN status = 'lapsed' THEN 1 ELSE 0 END) as lapsed_count
     FROM members
     WHERE org_id = ? AND status != 'archived'`,
    [org!.id]
  );

  const activeCount = Number(counts?.active_count ?? 0);
  const pendingCount = Number(counts?.pending_count ?? 0);
  const lapsedCount = Number(counts?.lapsed_count ?? 0);
  const totalMembers = activeCount + pendingCount + lapsedCount;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Here&apos;s what&apos;s happening at {org?.name}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active Members" value={activeCount} />
        <StatCard label="Pending" value={pendingCount} />
        <StatCard label="Lapsed" value={lapsedCount} />
      </div>

      <Card className="mt-6">
        <div className="mb-2 text-sm font-semibold text-off-white">
          Member capacity ({org?.planTier})
        </div>
        <ProgressBar value={totalMembers} max={org?.memberLimit ?? null} />
      </Card>
    </div>
  );
}
