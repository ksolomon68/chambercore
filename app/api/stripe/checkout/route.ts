import { NextResponse, type NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db/mysql";
import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";
import type { PlanTier } from "@/lib/types/database.types";

async function buildCheckoutUrl(
  _request: NextRequest,
  orgId: string,
  tier: string,
): Promise<{ url: string } | { error: string; status: number }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated.", status: 401 };

  const plan = PLANS[tier as PlanTier];
  if (!plan || !plan.selfServe || !plan.priceId) {
    return { error: "Invalid plan.", status: 400 };
  }

  const membership = await queryOne<{ role: string }>(
    "SELECT role FROM org_members WHERE org_id = ? AND user_id = ?",
    [orgId, user.id]
  );

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { error: "Not authorized for this organization.", status: 403 };
  }

  const org = await queryOne<{ stripe_customer_id: string | null; name: string }>(
    "SELECT stripe_customer_id, name FROM organizations WHERE id = ?",
    [orgId]
  );

  if (!org) return { error: "Organization not found.", status: 404 };

  let customerId = org.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { org_id: orgId },
    });
    customerId = customer.id;
    await execute(
      "UPDATE organizations SET stripe_customer_id = ? WHERE id = ?",
      [customerId, orgId]
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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

export async function POST(request: NextRequest) {
  const { orgId, tier } = await request.json();
  const result = await buildCheckoutUrl(request, orgId, tier);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ url: result.url });
}
