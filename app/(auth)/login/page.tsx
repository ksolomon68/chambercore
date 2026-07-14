import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Welcome back
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        Log in to your chamber&apos;s dashboard.
      </p>
      <LoginForm />
      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-text-dim">
        <Link href="/reset-password" className="text-gold hover:text-gold-light">
          Forgot password?
        </Link>
        <p>
          Don&apos;t have a chamber account yet?{" "}
          <Link href="/signup" className="text-gold hover:text-gold-light">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
