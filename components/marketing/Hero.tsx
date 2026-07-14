import { ButtonLink } from "@/components/ui/Button";

const stats = [
  { val: "12+", label: "Hours saved / week" },
  { val: "19", label: "Integrated modules" },
  { val: "2", label: "Role-based views" },
  { val: "$0", label: "Setup fee" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-40 text-center md:pt-48">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gold-light">
          Chamber Management Platform
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-off-white md:text-6xl">
          Stop Running Your Chamber
          <br />
          on <span className="text-gold-light">Spreadsheets</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-text-muted md:text-lg">
          ChamberCore is the all-in-one platform built from inside a
          chamber — automating dues, events, governance, advocacy, and
          member engagement so your staff can focus on what matters.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup" size="lg">
            Start Free Trial
          </ButtonLink>
          <ButtonLink href="#features" variant="outline" size="lg">
            Explore Features
          </ButtonLink>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-8 sm:gap-12">
              <div>
                <div className="font-display text-2xl font-bold text-gold-light md:text-3xl">
                  {s.val}
                </div>
                <div className="text-xs text-text-dim">{s.label}</div>
              </div>
              {i < stats.length - 1 && (
                <div className="hidden h-8 w-px bg-white/10 sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
