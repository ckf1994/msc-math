import { getRoleHome, isUserRole, type UserRole } from "@/lib/auth/roles";

export const VIEW_AS_COOKIE = "msc_view_as";

export function parseViewAsRole(value: string | undefined | null): UserRole | null {
  if (!isUserRole(value)) return null;
  return value;
}

export function allowedViewAsRoles(realRole: UserRole): UserRole[] {
  if (realRole === "admin") return ["admin", "teacher", "student"];
  if (realRole === "teacher") return ["teacher", "student"];
  return [];
}

export function isAllowedViewAs(realRole: UserRole, viewAs: UserRole | null) {
  if (!viewAs) return true;
  return allowedViewAsRoles(realRole).includes(viewAs);
}

export function resolveEffectiveRole(
  realRole: UserRole,
  viewAs: UserRole | null,
): UserRole {
  if (!viewAs || viewAs === realRole) return realRole;
  if (!isAllowedViewAs(realRole, viewAs)) return realRole;
  return viewAs;
}

export function viewAsHome(role: UserRole) {
  return getRoleHome(role);
}

export function canUseRolePreview(realRole: UserRole) {
  return realRole === "admin" || realRole === "teacher";
}
