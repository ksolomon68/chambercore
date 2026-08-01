import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  MemberStatus,
  MemberTier,
  OrgRole,
  PlanTier,
} from "@/lib/types/database.types";
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

export type CurrentMember = {
  id: string;
  orgId: string;
  businessName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  tier: MemberTier;
  status: MemberStatus;
  memberSince: string;
  orgName: string;
  orgSlug: string;
  primaryColor: string;
};

// Resolves the business-member record linked to the signed-in user, for the
// member self-service portal — the counterpart to getCurrentOrg() for staff.
// A user is expected to be either staff (org_members) or a member, not both.
export async function getCurrentMember(): Promise<CurrentMember | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members")
    .select(
      "id, org_id, business_name, contact_name, email, phone, tier, status, member_since",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) return null;

  // public_org_profile (not `organizations`) because a member has no
  // org_members row and therefore fails the organizations RLS policy.
  const { data: org } = await supabase
    .from("public_org_profile")
    .select("name, slug, primary_color")
    .eq("id", member.org_id)
    .maybeSingle();

  if (!org) return null;

  return {
    id: member.id,
    orgId: member.org_id,
    businessName: member.business_name,
    contactName: member.contact_name,
    email: member.email,
    phone: member.phone,
    tier: member.tier,
    status: member.status,
    memberSince: member.member_since,
    orgName: org.name,
    orgSlug: org.slug,
    primaryColor: org.primary_color,
  };
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return member;
}
