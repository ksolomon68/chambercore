import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planTier = plan === "professional" ? "professional" : "starter";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Start your chamber&apos;s free trial
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Set up your organization on the {planTier === "professional" ? "Professional" : "Starter"} plan in under a minute.
      </p>
      <SignupForm planTier={planTier} />
      <p className="mt-6 text-center text-sm text-text-dim">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:text-gold-light">
          Log in
        </Link>
      </p>
    </div>
  );
}
