import { ButtonLink } from "@/components/ui/Button";

export function ClosingSection() {
  return (
    <section className="border-t border-white/5 px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-3xl font-bold text-off-white md:text-4xl">
          Your chamber deserves
          <br />
          a platform built <span className="text-gold-light">for chambers</span>
        </h2>
        <p className="mt-5 text-text-muted">
          Not repurposed association software. Not a generic CRM. ChamberCore
          was designed from inside a chamber, for the specific way chambers
          actually work.
        </p>
        <div className="mt-8">
          <ButtonLink href="/signup" size="lg">
            Start Your Free Trial
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
