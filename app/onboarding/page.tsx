import Link from "next/link";
import { requireUser } from "@/lib/auth/session";

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-bold text-off-white">
          Almost there
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          We couldn&apos;t find a chamber linked to your account yet. If you just
          signed up, confirm your email and try logging in again. Otherwise,
          ask your chamber&apos;s admin to send you an invite.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block text-sm text-gold hover:text-gold-light"
        >
          Set up a new chamber instead
        </Link>
      </div>
    </div>
  );
}
