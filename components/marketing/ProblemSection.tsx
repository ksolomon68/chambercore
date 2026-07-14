const problems = [
  {
    icon: "📋",
    title: "Renewals chased manually",
    desc: "Staff spending hours every month tracking down dues, sending reminder emails one by one, and updating spreadsheets.",
  },
  {
    icon: "📅",
    title: "Events managed in email threads",
    desc: "RSVPs collected through reply-all chains. No ticketing. No check-in system. No way to know who actually showed up.",
  },
  {
    icon: "📊",
    title: "Board reports built from scratch",
    desc: "Executive directors spending 3–4 hours assembling data from multiple sources every single month before board meetings.",
  },
  {
    icon: "🗂️",
    title: "Governance scattered everywhere",
    desc: "Board minutes in email, bylaws in a shared drive, votes over text. No single source of truth for governance.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-t border-white/5 px-6 py-24" id="problem">
      <div className="mx-auto max-w-4xl text-center">
        <div className="section-label mb-3 text-xs font-semibold uppercase tracking-wide text-gold">
          The Problem
        </div>
        <h2 className="font-display text-3xl font-bold text-off-white md:text-4xl">
          Your chamber staff is spending
          <br />
          12+ hours a week on tasks
          <br />a platform should handle.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-text-muted">
          Most chamber software was built to store data. Not to run a
          chamber. The result is a pile of disconnected tools, manual
          workarounds, and overworked staff.
        </p>
        <div className="mt-12 grid gap-5 text-left sm:grid-cols-2">
          {problems.map((p) => (
            <div
              key={p.title}
              className="flex gap-4 rounded-xl border border-card-border bg-card-bg p-5"
            >
              <div className="text-2xl">{p.icon}</div>
              <div>
                <div className="font-semibold text-off-white">{p.title}</div>
                <div className="mt-1 text-sm text-text-muted">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
