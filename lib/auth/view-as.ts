import { getRoleHome, isUserRole, type UserRole } from "@/lib/auth/roles";

export const VIEW_AS_COOKIE = "msc_view_as";

export function parseViewAsRole(value: string | undefined | null): UserRole | null {
  if (!isUserRole(value)) return null;
  return value;
}

export function resolveEffectiveRole(
  realRole: UserRole,
  viewAs: UserRole | null,
): UserRole {
  if (realRole !== "admin" || !viewAs) return realRole;
  return viewAs;
}

export function viewAsHome(role: UserRole) {
  return getRoleHome(role);
}
