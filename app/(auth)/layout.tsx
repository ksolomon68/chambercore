import Image from "next/image";
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
          <Image src="/favicon.png" alt="" width={32} height={32} className="rounded-md" />
          ChamberCore
        </Link>
        <div className="rounded-xl border border-card-border bg-card-bg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
