import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OrgRole, PlanTier } from "@/lib/types/database.types";
import { CURRENT_ORG_COOKIE } from "@/lib/auth/constants";

export { CURRENT_ORG_COOKIE };

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type CurrentOrg = {
  id: string;
  name: string;
  slug: string;
  planTier: PlanTier;
  memberLimit: number | null;
  role: OrgRole;
};

// Resolves which chamber the signed-in user is currently acting within.
// Users can belong to multiple orgs (e.g. a consultant working with several
// chambers); the choice is sticky via a cookie and falls back to their first
// membership. Membership is re-verified against org_members every call —
// this is the app-layer half of tenant isolation; RLS is the hard guarantee.
export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const cookieStore = await cookies();
  const preferredOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;

  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) return null;

  const match =
    memberships.find((m) => m.org_id === preferredOrgId) ?? memberships[0];

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, plan_tier, member_limit")
    .eq("id", match.org_id)
    .maybeSingle();

  if (!org) return null;

  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    planTier: org.plan_tier as PlanTier,
    memberLimit: org.member_limit,
    role: match.role as OrgRole,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOrg() {
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");
  return org;
}

export async function requireRole(minimum: OrgRole) {
  const { hasRole } = await import("@/lib/auth/permissions");
  const org = await requireOrg();
  if (!hasRole(org.role, minimum)) {
    redirect("/dashboard?error=forbidden");
  }
  return org;
}
