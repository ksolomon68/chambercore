"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav-config";

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-card-border bg-navy-mid md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-card-border px-5">
        <Image src="/favicon.png" alt="" width={32} height={32} className="rounded-md" />
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold text-off-white">
            {orgName}
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4 px-3">
            <div className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-text-dim">
              {section.label}
            </div>
            {section.items.map((item) =>
              item.comingSoon ? (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-text-dim"
                >
                  <span className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                  <span className="rounded-full border border-gold/25 bg-gold/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold-light">
                    Soon
                  </span>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-gold/10 text-gold-light"
                      : "text-text-muted hover:bg-white/5 hover:text-off-white"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ),
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
