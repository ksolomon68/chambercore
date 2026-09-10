import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";
import { stripe } from "@/lib/stripe/client";
import { planByPriceId } from "@/lib/stripe/plans";
import { execute, transaction } from "@/lib/db/mysql";

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.org_id;
      if (!orgId || !session.subscription || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );
      await syncSubscription(orgId, subscription, session.customer as string);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.org_id;
      if (!orgId) break;
      await syncSubscription(orgId, subscription, subscription.customer as string);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = subscription.metadata?.org_id;
      if (!orgId) break;
      await execute(
        "UPDATE subscriptions SET status = 'canceled', cancel_at_period_end = 0 WHERE org_id = ?",
        [orgId]
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (!subscriptionId) break;
      await execute(
        "UPDATE subscriptions SET status = 'past_due' WHERE stripe_subscription_id = ?",
        [subscriptionId]
      );
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscription(
  orgId: string,
  subscription: Stripe.Subscription,
  customerId: string,
) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? planByPriceId(priceId) : undefined;
  const tier = plan?.tier ?? "starter";
  const memberLimit = plan?.memberLimit ?? null;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  const periodEndDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
  const subId = crypto.randomUUID();

  await transaction(async (conn) => {
    await conn.execute(
      `UPDATE organizations
       SET stripe_customer_id = ?, plan_tier = ?, member_limit = ?
       WHERE id = ?`,
      [customerId, tier, memberLimit, orgId]
    );

    await conn.execute(
      `INSERT INTO subscriptions (
        id, org_id, stripe_subscription_id, stripe_price_id, plan_tier, status, current_period_end, cancel_at_period_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        stripe_subscription_id = VALUES(stripe_subscription_id),
        stripe_price_id = VALUES(stripe_price_id),
        plan_tier = VALUES(plan_tier),
        status = VALUES(status),
        current_period_end = VALUES(current_period_end),
        cancel_at_period_end = VALUES(cancel_at_period_end)`,
      [
        subId,
        orgId,
        subscription.id,
        priceId ?? null,
        tier,
        subscription.status,
        periodEndDate,
        subscription.cancel_at_period_end ? 1 : 0,
      ]
    );
  });
}
