import { getCurrentOrg } from "@/lib/auth/session";
import { queryOne } from "@/lib/db/mysql";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { BillingActions } from "@/components/settings/BillingActions";
import { PLANS } from "@/lib/stripe/plans";

export default async function BillingSettingsPage() {
  const org = await getCurrentOrg();

  const memberCountResult = org?.id
    ? await queryOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM members WHERE org_id = ? AND status != 'archived'",
        [org.id]
      )
    : null;
  const memberCount = memberCountResult?.count ?? 0;

  const fullOrg = org?.id
    ? await queryOne<{ stripe_customer_id: string | null; plan_tier: string }>(
        "SELECT stripe_customer_id, plan_tier FROM organizations WHERE id = ? LIMIT 1",
        [org.id]
      )
    : null;

  const subscription = org?.id
    ? await queryOne<{ id: string; status: string }>(
        "SELECT id, status FROM subscriptions WHERE org_id = ? LIMIT 1",
        [org.id]
      )
    : null;

  const plan = PLANS[org!.planTier];
  const nextTier = org!.planTier === "starter" ? "professional" : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Billing
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Manage your chamber&apos;s subscription and payment method.
      </p>

      <div className="flex flex-col gap-4 max-w-xl">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-text-muted">
                Current Plan
              </div>
              <div className="mt-1 font-display text-xl font-bold text-off-white">
                {plan.name}
              </div>
            </div>
            {subscription && <Badge tone="gold">{subscription.status}</Badge>}
          </div>
          <div className="mt-4">
            <div className="mb-1 text-xs text-text-muted">Member usage</div>
            <ProgressBar value={memberCount} max={org!.memberLimit} />
          </div>
        </Card>

        <Card>
          <BillingActions
            orgId={org!.id}
            hasCustomer={Boolean(fullOrg?.stripe_customer_id)}
            canUpgrade={nextTier}
          />
        </Card>
      </div>
    </div>
  );
}

