const features = [
  {
    icon: "💳",
    title: "Automated Dues & Renewals",
    desc: "Tiered billing with auto-pay, renewal reminders triggered automatically, and lapse workflows that run without staff intervention.",
    tag: "Saves 6 hrs/mo",
  },
  {
    icon: "📱",
    title: "QR Code Check-In & Badging",
    desc: "Mobile-ready QR scanner for event door check-in. Instant badge printing. Live attendance tracking. Runs on any phone or tablet.",
    tag: "Works on any device",
  },
  {
    icon: "🤝",
    title: "Member-to-Member Marketplace",
    desc: "Exclusive deals and job postings visible only to active members. Real value that makes membership tangible every time they log in.",
    tag: "Members-only",
  },
  {
    icon: "🏛️",
    title: "Board & Governance Portal",
    desc: "Digital voting, document vault, meeting agendas, minutes archive, and committee management — all in one private portal.",
    tag: "Board access",
  },
  {
    icon: "⚖️",
    title: "Legislative Action Center",
    desc: "Monitor legislation, publish chamber positions, and launch member email campaigns to elected officials with one click.",
    tag: "Advocacy built-in",
  },
  {
    icon: "📊",
    title: "One-Click Board Report",
    desc: "Generate a complete executive report — retention rate, revenue breakdown, at-risk members, event ROI — in under 30 seconds. The sales closer.",
    tag: "Coming soon",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-white/5 px-6 py-24" id="features">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold">
            The Solution
          </div>
          <h2 className="font-display text-3xl font-bold text-off-white md:text-4xl">
            One platform. Every module
            <br />
            your chamber actually needs.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-muted">
            Built by someone who sits on a chamber board. Every feature solves
            a real operational problem.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-card-border bg-card-bg p-6"
            >
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-3 font-semibold text-off-white">
                {f.title}
              </div>
              <div className="mt-2 text-sm text-text-muted">{f.desc}</div>
              <span className="mt-4 inline-block rounded-full border border-teal/25 bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
