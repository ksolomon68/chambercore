const modules = [
  { icon: "📊", name: "Dashboard", desc: "Live stats, activity feed, upcoming events" },
  { icon: "👥", name: "Member Management", desc: "Directory, status tracking, onboarding" },
  { icon: "🏢", name: "Business Directory", desc: "Public-facing searchable member listings" },
  { icon: "🤝", name: "M2M Marketplace", desc: "Member deals & job board" },
  { icon: "🗓️", name: "Events & Registration", desc: "Ticketing, RSVPs, sponsor management" },
  { icon: "🎀", name: "Ribbon Cuttings", desc: "Requests + auto social media kit" },
  { icon: "📧", name: "Communications Hub", desc: "Templates, campaigns, AI draft assist" },
  { icon: "💳", name: "Dues & Payments", desc: "Invoicing, auto-pay, aging reports" },
  { icon: "⭐", name: "Sponsorship Management", desc: "Tiers, fulfillment, ROI tracking" },
  { icon: "🏛️", name: "Board Overview", desc: "Attendance, votes, activity log" },
  { icon: "📋", name: "Meetings & Agendas", desc: "RSVP, agendas, minutes archive" },
  { icon: "🗳️", name: "Voting & Polls", desc: "Digital board votes with live results" },
  { icon: "📁", name: "Document Vault", desc: "Bylaws, financials, policies, minutes" },
  { icon: "🏢", name: "Committees", desc: "Rosters, scheduling, assignments" },
  { icon: "📱", name: "QR Check-In", desc: "Mobile scanner + instant badge print" },
  { icon: "⚖️", name: "Legislative Action", desc: "Issue tracking, positions, campaigns" },
  { icon: "📈", name: "Analytics", desc: "Retention, engagement, at-risk alerts" },
  { icon: "👤", name: "Member Portal", desc: "Self-service profile, dues, events" },
  {
    icon: "📄",
    name: "Board Report PDF",
    desc: "One-click executive report — coming soon",
    comingSoon: true,
  },
];

export function ModuleShowcase() {
  return (
    <section className="border-t border-white/5 px-6 py-24" id="modules">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold">
            All 19 Modules
          </div>
          <h2 className="font-display text-3xl font-bold text-off-white md:text-4xl">
            Everything in one platform
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {modules.map((m) => (
            <div
              key={m.name}
              className={`rounded-xl border p-4 ${
                m.comingSoon
                  ? "border-gold/30 bg-gold/10"
                  : "border-card-border bg-card-bg"
              }`}
            >
              <div className="text-xl">{m.icon}</div>
              <div className="mt-2 text-sm font-semibold text-off-white">
                {m.name}
              </div>
              <div
                className={`mt-1 text-xs ${
                  m.comingSoon ? "text-gold-light" : "text-text-dim"
                }`}
              >
                {m.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
