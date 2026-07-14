export default function ContactPage() {
  return (
    <section className="mx-auto max-w-lg px-6 py-32">
      <h1 className="font-display text-3xl font-bold text-off-white">
        Talk to us about Enterprise
      </h1>
      <p className="mt-3 mb-8 text-text-muted">
        Custom branding, API integrations, and a dedicated account manager for
        chambers with 500+ members or multiple locations.
      </p>
      <form
        action="https://formspree.io/f/xpqgvaga"
        method="POST"
        className="flex flex-col gap-4"
      >
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Full Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Chamber Name
          </label>
          <input
            name="chamber"
            required
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Work Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-muted">
            Tell us about your chamber
          </label>
          <textarea
            name="message"
            rows={4}
            placeholder="Member count, number of locations, integrations you need..."
            className="w-full rounded-lg border border-card-border bg-navy px-3 py-2.5 text-sm text-off-white outline-none focus:border-gold"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-light"
        >
          Send Enquiry
        </button>
      </form>
    </section>
  );
}
