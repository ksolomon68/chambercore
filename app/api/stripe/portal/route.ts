import { NextResponse, type NextRequest } from "next/server";
import { queryOne } from "@/lib/db/mysql";
import { getCurrentUser } from "@/lib/auth/session";
import { stripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const { orgId } = await request.json();

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const membership = await queryOne<{ role: string }>(
    "SELECT role FROM org_members WHERE org_id = ? AND user_id = ?",
    [orgId, user.id]
  );

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const org = await queryOne<{ stripe_customer_id: string | null }>(
    "SELECT stripe_customer_id FROM organizations WHERE id = ?",
    [orgId]
  );

  if (!org?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account yet — choose a plan first." },
      { status: 400 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${siteUrl}/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
