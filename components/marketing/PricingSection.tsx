import { ButtonLink } from "@/components/ui/Button";
import { PLANS } from "@/lib/stripe/plans";

export function PricingSection() {
  return (
    <section className="border-t border-white/5 px-6 py-24" id="pricing">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold">
          Pricing
        </div>
        <h2 className="font-display text-3xl font-bold text-off-white md:text-4xl">
          Simple, flat-rate pricing
        </h2>
        <p className="mt-3 text-text-muted">
          No per-member fees. No surprise add-ons. One price, full platform.
        </p>

        <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded-xl border p-7 ${
                plan.tier === "professional"
                  ? "scale-[1.03] border-gold bg-gold/5"
                  : "border-card-border bg-card-bg"
              }`}
            >
              {plan.tier === "professional" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">
                  Most Popular
                </div>
              )}
              <div className="text-xs font-bold uppercase tracking-wide text-text-muted">
                {plan.name}
              </div>
              <div className="mt-2 font-display font-bold text-off-white">
                {plan.monthlyPrice ? (
                  <>
                    <span className="text-3xl">${plan.monthlyPrice}</span>
                    <span className="text-base text-text-muted">/mo</span>
                  </>
                ) : (
                  <span className="text-3xl">Custom</span>
                )}
              </div>
              <div className="mt-1.5 text-xs text-text-dim">
                {plan.description}
              </div>
              <ul className="mt-5 flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-text-muted"
                  >
                    <span className="mt-0.5 text-green">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={plan.selfServe ? `/signup?plan=${plan.tier}` : "/contact"}
                variant={plan.tier === "professional" ? "filled" : "outline"}
                className="mt-6 w-full"
              >
                {plan.selfServe ? "Start Free Trial" : "Contact Us"}
              </ButtonLink>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-text-dim">
          All plans include free data migration, staff training, and a 30-day
          money-back guarantee. No setup fees.
        </p>
      </div>
    </section>
  );
}
