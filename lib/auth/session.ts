import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db/mysql";
import { verifyJwt } from "@/lib/auth/jwt";
import type {
  MemberStatus,
  MemberTier,
  OrgRole,
  PlanTier,
} from "@/lib/types/database.types";
import { CURRENT_ORG_COOKIE, AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export { CURRENT_ORG_COOKIE, AUTH_COOKIE_NAME };

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role?: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const payload = verifyJwt<{ sub: string; email: string; fullName?: string; role?: string }>(sessionToken);
  if (!payload || !payload.sub) return null;

  const user = await queryOne<{ id: string; email: string; full_name: string | null; role: string }>(
    "SELECT id, email, full_name, role FROM users WHERE id = ?",
    [payload.sub]
  );

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

export type CurrentOrg = {
  id: string;
  name: string;
  slug: string;
  planTier: PlanTier;
  memberLimit: number | null;
  role: OrgRole;
};

export async function getCurrentOrg(): Promise<CurrentOrg | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const preferredOrgId = cookieStore.get(CURRENT_ORG_COOKIE)?.value;

  const memberships = await query<{ org_id: string; role: string }>(
    "SELECT org_id, role FROM org_members WHERE user_id = ?",
    [user.id]
  );

  if (!memberships || memberships.length === 0) return null;

  const match =
    memberships.find((m) => m.org_id === preferredOrgId) ?? memberships[0];

  const org = await queryOne<{
    id: string;
    name: string;
    slug: string;
    plan_tier: string;
    member_limit: number | null;
  }>(
    "SELECT id, name, slug, plan_tier, member_limit FROM organizations WHERE id = ?",
    [match.org_id]
  );

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

export async function getCurrentMember(): Promise<CurrentMember | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const member = await queryOne<{
    id: string;
    org_id: string;
    business_name: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    tier: string;
    status: string;
    member_since: string | Date;
  }>(
    "SELECT id, org_id, business_name, contact_name, email, phone, tier, status, member_since FROM members WHERE user_id = ?",
    [user.id]
  );

  if (!member) return null;

  const org = await queryOne<{
    name: string;
    slug: string;
    primary_color: string;
  }>(
    "SELECT name, slug, primary_color FROM organizations WHERE id = ?",
    [member.org_id]
  );

  if (!org) return null;

  const memberSinceStr = member.member_since instanceof Date
    ? member.member_since.toISOString().split("T")[0]
    : String(member.member_since);

  return {
    id: member.id,
    orgId: member.org_id,
    businessName: member.business_name,
    contactName: member.contact_name,
    email: member.email,
    phone: member.phone,
    tier: member.tier as MemberTier,
    status: member.status as MemberStatus,
    memberSince: memberSinceStr,
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
