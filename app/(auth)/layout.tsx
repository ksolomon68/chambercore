import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold text-off-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gold font-display text-sm font-bold text-navy">
            C
          </span>
          ChamberCore
        </Link>
        <div className="rounded-xl border border-card-border bg-card-bg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
