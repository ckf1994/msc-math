export type UserRole = "student" | "teacher" | "admin";

export const ROLE_HOME: Record<UserRole, string> = {
  student: "/student",
  teacher: "/teacher",
  admin: "/admin",
};

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "student" || value === "teacher" || value === "admin";
}

export function getRoleHome(role: UserRole): string {
  return ROLE_HOME[role];
}
