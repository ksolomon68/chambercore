import Link from "next/link";
import { requireMember } from "@/lib/auth/session";
import { TierBadge } from "@/components/members/TierBadge";
import { StatusBadge } from "@/components/members/StatusBadge";

export default async function PortalHomePage() {
  const member = await requireMember();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        {member.businessName}
      </h1>
      <div className="mt-2 flex items-center gap-2">
        <TierBadge tier={member.tier} />
        <StatusBadge status={member.status} />
        <span className="text-xs text-text-dim">
          Member since {new Date(member.memberSince).getFullYear()}
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/portal/profile"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">👤</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            My Profile
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Update your contact info and directory listing.
          </p>
        </Link>
        <a
          href={`/c/${member.orgSlug}`}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">🏢</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Directory
          </div>
          <p className="mt-1 text-xs text-text-muted">
            See how your listing appears to the public.
          </p>
        </a>
        <Link
          href="/portal/dues"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">💳</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Dues &amp; Billing
          </div>
          <p className="mt-1 text-xs text-text-muted">
            View your membership and payment history.
          </p>
        </Link>
        <Link
          href="/portal/events"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">🗓️</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            My Events
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Browse and register for upcoming events.
          </p>
        </Link>
        <Link
          href="/portal/marketplace"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">🤝</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Marketplace
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Member deals and job postings.
          </p>
        </Link>
        <Link
          href="/portal/meetings"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">📋</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Meetings &amp; Agendas
          </div>
          <p className="mt-1 text-xs text-text-muted">
            See upcoming meetings and RSVP.
          </p>
        </Link>
        <Link
          href="/portal/documents"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">📁</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Document Vault
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Browse and download chamber documents.
          </p>
        </Link>
        <Link
          href="/portal/board"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">🏛️</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Board Roster
          </div>
          <p className="mt-1 text-xs text-text-muted">
            See who&apos;s on the board of directors.
          </p>
        </Link>
        <Link
          href="/portal/committees"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">📣</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Committees
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Browse board committees and their members.
          </p>
        </Link>
        <Link
          href="/portal/voting"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">🗳️</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Voting &amp; Polls
          </div>
          <p className="mt-1 text-xs text-text-muted">
            See open votes and results.
          </p>
        </Link>
        <Link
          href="/portal/advocacy"
          className="block rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-gold/40"
        >
          <div className="text-2xl">⚖️</div>
          <div className="mt-2 text-sm font-semibold text-off-white">
            Legislative Action
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Stay informed and contact your officials.
          </p>
        </Link>
      </div>
    </div>
  );
}
