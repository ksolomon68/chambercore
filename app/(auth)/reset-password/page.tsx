import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-off-white">
        Reset your password
      </h1>
      <p className="mt-1 mb-6 text-sm text-text-muted">
        We&apos;ll email you a link to choose a new password.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
