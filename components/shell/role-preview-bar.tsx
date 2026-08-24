"use client";

import { setViewAsRoleAction } from "@/app/admin/view-as/actions";
import type { UserRole } from "@/lib/auth/roles";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
];

type RolePreviewBarProps = {
  activeRole: UserRole;
  isViewingAs: boolean;
};

export function RolePreviewBar({ activeRole, isViewingAs }: RolePreviewBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-300/80 bg-amber-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <p className="text-xs font-semibold text-amber-900">
          Admin test bar
          {isViewingAs ? (
            <span className="ml-2 font-medium text-amber-700">
              · viewing as {activeRole}
            </span>
          ) : (
            <span className="ml-2 font-medium text-amber-700">
              · switch role to preview UI
            </span>
          )}
        </p>

        <div className="flex items-center gap-1.5">
          {ROLES.map((role) => {
            const isActive = activeRole === role.value;
            return (
              <form key={role.value} action={setViewAsRoleAction}>
                <input type="hidden" name="role" value={role.value} />
                <button
                  type="submit"
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-msc-red text-white shadow-sm"
                      : "bg-white text-msc-ink ring-1 ring-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {role.label}
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
