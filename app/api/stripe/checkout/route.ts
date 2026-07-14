import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";
import type { PlanTier } from "@/lib/types/database.types";

async function buildCheckoutUrl(
  request: NextRequest,
  orgId: string,
  tier: string,
): Promise<{ url: string } | { error: string; status: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated.", status: 401 };

  const plan = PLANS[tier as PlanTier];
  if (!plan || !plan.selfServe || !plan.priceId) {
    return { error: "Invalid plan.", status: 400 };
  }

  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Not authorized for this organization.", status: 403 };
  }

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("stripe_customer_id, name")
    .eq("id", orgId)
    .maybeSingle();

  if (!org) return { error: "Organization not found.", status: 404 };

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { org_id: orgId },
    });
    customerId = customer.id;
    await admin
      .from("organizations")
      .update({ stripe_customer_id: customerId })
      .eq("id", orgId);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/settings/billing?checkout=cancelled`,
    metadata: { org_id: orgId },
    subscription_data: { metadata: { org_id: orgId } },
  });

  if (!session.url) return { error: "Could not start checkout.", status: 500 };
  return { url: session.url };
}

// Used by the post-signup redirect (a plain browser navigation).
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");
  const tier = request.nextUrl.searchParams.get("tier");
  if (!orgId || !tier) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const result = await buildCheckoutUrl(request, orgId, tier);
  if ("error" in result) {
    return NextResponse.redirect(
      new URL(`/dashboard?checkoutError=${encodeURIComponent(result.error)}`, request.url),
    );
  }
  return NextResponse.redirect(result.url);
}

// Used by settings/billing (fetch call) to launch checkout for an upgrade.
export async function POST(request: NextRequest) {
  const { orgId, tier } = await request.json();
  const result = await buildCheckoutUrl(request, orgId, tier);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ url: result.url });
}
