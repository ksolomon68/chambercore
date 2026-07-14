import type { PlanTier } from "@/lib/types/database.types";

export type PlanConfig = {
  tier: PlanTier;
  name: string;
  priceId: string | null;
  monthlyPrice: number | null;
  memberLimit: number | null;
  description: string;
  features: string[];
  selfServe: boolean;
};

// Mirrors the pricing section on the marketing homepage (reference/index.html,
// "Simple, flat-rate pricing") verbatim. Price IDs come from env vars set
// after creating the corresponding Stripe Products/Prices.
export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    tier: "starter",
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    monthlyPrice: 299,
    memberLimit: 200,
    description: "Up to 200 members • Annual billing",
    features: [
      "All 19 platform modules",
      "Staff + member role access",
      "Events & QR check-in",
      "M2M marketplace",
      "Email support",
    ],
    selfServe: true,
  },
  professional: {
    tier: "professional",
    name: "Professional",
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? null,
    monthlyPrice: 499,
    memberLimit: 500,
    description: "Up to 500 members • Annual billing",
    features: [
      "Everything in Starter",
      "Board & governance portal",
      "Legislative action center",
      "Advanced analytics & alerts",
      "Board report PDF generator",
      "Priority support + onboarding",
    ],
    selfServe: true,
  },
  enterprise: {
    tier: "enterprise",
    name: "Enterprise",
    priceId: null,
    monthlyPrice: null,
    memberLimit: null,
    description: "500+ members • Multi-location",
    features: [
      "Everything in Professional",
      "Custom branding & domain",
      "API & accounting integrations",
      "Dedicated account manager",
      "White-label available",
    ],
    selfServe: false,
  },
};

export function planByPriceId(priceId: string): PlanConfig | undefined {
  return Object.values(PLANS).find((p) => p.priceId === priceId);
}
