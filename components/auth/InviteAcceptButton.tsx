"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CURRENT_ORG_COOKIE } from "@/lib/auth/constants";

export function InviteAcceptButton({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function accept() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/invites/${token}/accept`, { method: "POST" });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Something went wrong.");
      setPending(false);
      return;
    }
    document.cookie = `${CURRENT_ORG_COOKIE}=${body.orgId}; path=/; samesite=lax`;
    router.push("/dashboard");
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      <Button onClick={accept} disabled={pending} className="w-full">
        {pending ? "Joining..." : "Accept Invite"}
      </Button>
    </div>
  );
}
