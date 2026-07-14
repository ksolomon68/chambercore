import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();

  const { count: activeCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org!.id)
    .eq("status", "active");

  const { count: pendingCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org!.id)
    .eq("status", "pending");

  const { count: lapsedCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org!.id)
    .eq("status", "lapsed");

  const totalMembers = (activeCount ?? 0) + (pendingCount ?? 0) + (lapsedCount ?? 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Here&apos;s what&apos;s happening at {org?.name}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active Members" value={activeCount ?? 0} />
        <StatCard label="Pending" value={pendingCount ?? 0} />
        <StatCard label="Lapsed" value={lapsedCount ?? 0} />
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
