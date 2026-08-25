"use client";

import { setViewAsRoleAction } from "@/app/view-as/actions";
import type { UserRole } from "@/lib/auth/roles";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

type RolePreviewBarProps = {
  realRole: UserRole;
  activeRole: UserRole;
  isViewingAs: boolean;
};

export function RolePreviewBar({
  realRole,
  activeRole,
  isViewingAs,
}: RolePreviewBarProps) {
  const roles: UserRole[] =
    realRole === "admin"
      ? ["admin", "teacher", "student"]
      : ["teacher", "student"];

  const barLabel = realRole === "admin" ? "Admin test bar" : "Teacher preview bar";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-300/80 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <p className="text-xs font-semibold text-amber-900">
          {barLabel}
          {isViewingAs ? (
            <span className="ml-2 font-medium text-amber-700">
              · viewing as {ROLE_LABELS[activeRole]}
            </span>
          ) : (
            <span className="ml-2 font-medium text-amber-700">
              · switch role to preview UI
            </span>
          )}
        </p>

        <div className="flex items-center gap-1.5">
          {roles.map((role) => {
            const isActive = activeRole === role;
            return (
              <form key={role} action={setViewAsRoleAction}>
                <input type="hidden" name="role" value={role} />
                <button
                  type="submit"
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-msc-red text-white shadow-sm"
                      : "bg-white text-msc-ink ring-1 ring-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
