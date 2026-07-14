import type { OrgRole } from "@/lib/types/database.types";

export const ROLE_RANK: Record<OrgRole, number> = {
  staff: 1,
  admin: 2,
  owner: 3,
};

export function hasRole(role: OrgRole | null, minimum: OrgRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function canManageBilling(role: OrgRole | null) {
  return hasRole(role, "admin");
}

export function canManageTeam(role: OrgRole | null) {
  return hasRole(role, "admin");
}

export function canDeleteMembers(role: OrgRole | null) {
  return hasRole(role, "admin");
}

export function canEditMembers(role: OrgRole | null) {
  return hasRole(role, "staff");
}
