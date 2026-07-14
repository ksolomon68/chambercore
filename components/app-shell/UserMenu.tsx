"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export function UserMenu({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-muted hover:bg-white/5 hover:text-off-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-light">
          {userEmail.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden sm:inline">{userEmail}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-card-border bg-navy-mid p-1 shadow-xl">
          <Link
            href="/settings/organization"
            className="block rounded-md px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-off-white"
          >
            Organization Settings
          </Link>
          <Link
            href="/settings/team"
            className="block rounded-md px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-off-white"
          >
            Team
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-text-muted hover:bg-white/5 hover:text-off-white"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
