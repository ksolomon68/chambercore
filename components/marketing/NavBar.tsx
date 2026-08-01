import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#modules", label: "Modules" },
  { href: "#pricing", label: "Pricing" },
];

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-navy/90 px-6 backdrop-blur-lg md:px-12">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/favicon.png" alt="" width={32} height={32} className="rounded-md" />
        <span className="font-display text-lg font-bold text-off-white">
          ChamberCore
        </span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-sm font-medium text-text-muted transition-colors hover:text-off-white"
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden text-sm font-medium text-text-muted hover:text-off-white sm:block"
        >
          Log in
        </Link>
        <ButtonLink href="/signup" size="sm">
          Start Free Trial
        </ButtonLink>
      </div>
    </nav>
  );
}
