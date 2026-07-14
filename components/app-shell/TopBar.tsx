import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { UserMenu } from "./UserMenu";
import type { PlanTier } from "@/lib/types/database.types";

const PLAN_LABEL: Record<PlanTier, string> = {
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
};

export function TopBar({
  planTier,
  userEmail,
}: {
  planTier: PlanTier;
  userEmail: string;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-card-border bg-navy-mid px-6">
      <div className="flex items-center gap-3">
        <Badge tone="gold">{PLAN_LABEL[planTier]} Plan</Badge>
        <Link
          href="/settings/billing"
          className="text-xs text-text-dim hover:text-text-muted"
        >
          Manage billing
        </Link>
      </div>
      <UserMenu userEmail={userEmail} />
    </header>
  );
}
