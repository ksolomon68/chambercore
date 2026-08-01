import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function PortalHeader({
  orgName,
  businessName,
}: {
  orgName: string;
  businessName: string;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-card-border bg-navy-mid px-6">
      <div className="flex items-center gap-2.5">
        <Image src="/favicon.png" alt="" width={32} height={32} className="rounded-md" />
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-bold text-off-white">
            {orgName}
          </div>
          <div className="truncate text-xs text-text-dim">{businessName}</div>
        </div>
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/portal" className="text-text-muted hover:text-off-white">
          Dashboard
        </Link>
        <Link
          href="/portal/profile"
          className="text-text-muted hover:text-off-white"
        >
          My Profile
        </Link>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Log out
          </Button>
        </form>
      </nav>
    </header>
  );
}
