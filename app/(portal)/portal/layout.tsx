import { requireMember } from "@/lib/auth/session";
import { PortalHeader } from "@/components/portal/PortalHeader";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireMember();

  return (
    <div className="min-h-screen bg-navy">
      <PortalHeader orgName={member.orgName} businessName={member.businessName} />
      <main className="mx-auto max-w-5xl p-6 md:p-8">{children}</main>
    </div>
  );
}
