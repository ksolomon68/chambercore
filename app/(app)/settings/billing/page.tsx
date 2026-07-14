import { getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { BillingActions } from "@/components/settings/BillingActions";
import { PLANS } from "@/lib/stripe/plans";

export default async function BillingSettingsPage() {
  const org = await getCurrentOrg();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("org_id", org!.id)
    .neq("status", "archived");

  const { data: fullOrg } = await admin
    .from("organizations")
    .select("stripe_customer_id, plan_tier")
    .eq("id", org!.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", org!.id)
    .maybeSingle();

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
            <ProgressBar value={memberCount ?? 0} max={org!.memberLimit} />
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
