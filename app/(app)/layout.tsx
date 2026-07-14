import { redirect } from "next/navigation";
import { requireUser, getCurrentOrg } from "@/lib/auth/session";
import { Sidebar } from "@/components/app-shell/Sidebar";
import { TopBar } from "@/components/app-shell/TopBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const org = await getCurrentOrg();

  if (!org) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar orgName={org.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar planTier={org.planTier} userEmail={user.email ?? ""} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
