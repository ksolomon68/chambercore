import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { planByPriceId } from "@/lib/stripe/plans";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.org_id;
      if (!orgId || !session.subscription || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await syncSubscription(admin, orgId, subscription, session.customer as string);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.org_id;
      if (!orgId) break;
      await syncSubscription(admin, orgId, subscription, subscription.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.org_id;
      if (!orgId) break;
      await admin
        .from("subscriptions")
        .update({ status: "canceled", cancel_at_period_end: false })
        .eq("org_id", orgId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (!subscriptionId) break;
      await admin
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_subscription_id", subscriptionId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string,
  subscription: Stripe.Subscription,
  customerId: string,
) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? planByPriceId(priceId) : undefined;
  const tier = plan?.tier ?? "starter";
  const memberLimit = plan?.memberLimit ?? null;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  await admin.from("organizations").update({
    stripe_customer_id: customerId,
    plan_tier: tier,
    member_limit: memberLimit,
  }).eq("id", orgId);

  await admin.from("subscriptions").upsert(
    {
      org_id: orgId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId ?? null,
      plan_tier: tier,
      status: subscription.status,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: "org_id" },
  );
}
