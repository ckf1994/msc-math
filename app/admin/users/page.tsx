import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateUserRoleAction } from "@/app/admin/users/actions";
import type { Profile } from "@/types/database";

type ClassMemberRecord = {
  user_id: string;
  role_in_class: "student" | "teacher";
  class: {
    name: string;
    form_level: number;
  } | null;
};

type ClassMembershipRow = {
  user_id: string;
  role_in_class: "student" | "teacher";
  class:
    | {
        name: string;
        form_level: number;
      }
    | {
        name: string;
        form_level: number;
      }[]
    | null;
};

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: profiles }, { data: memberships }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, email, full_name, role, avatar_url, is_test_account, current_streak, longest_streak, total_xp, created_at",
      )
      .order("created_at", { ascending: true }),
    supabase.from("class_members").select(`
        user_id,
        role_in_class,
        class:classes (
          name,
          form_level
        )
      `),
  ]);

  const users = (profiles ?? []) as Profile[];
  const classMemberships = ((memberships ?? []) as ClassMembershipRow[]).map(
    (membership) => ({
      ...membership,
      class: Array.isArray(membership.class)
        ? (membership.class[0] ?? null)
        : membership.class,
    }),
  );
  const membershipsByUser = new Map<string, ClassMemberRecord[]>();

  classMemberships.forEach((membership) => {
    const existing = membershipsByUser.get(membership.user_id) ?? [];
    existing.push(membership);
    membershipsByUser.set(membership.user_id, existing);
  });

  const stats = {
    total: users.length,
    students: users.filter((user) => user.role === "student").length,
    teachers: users.filter((user) => user.role === "teacher").length,
    admins: users.filter((user) => user.role === "admin").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Users</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Manage account roles for students, teachers, and school admins. Test
          accounts are marked so you can identify development logins easily.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.total} />
        <StatCard label="Students" value={stats.students} />
        <StatCard label="Teachers" value={stats.teachers} />
        <StatCard label="Admins" value={stats.admins} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-msc-ink">All profiles</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Roles update immediately and affect route access after the next page load.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <div className="px-5 py-8 text-sm text-msc-muted">
              No users found yet. Create test accounts in Supabase Authentication first.
            </div>
          ) : (
            users.map((user) => {
              const userMemberships = membershipsByUser.get(user.id) ?? [];

              return (
                <div
                  key={user.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_220px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-msc-ink">
                        {user.full_name || "Unnamed user"}
                      </h3>
                      <RolePill role={user.role} />
                      {user.is_test_account ? <TestPill /> : null}
                    </div>
                    <p className="mt-1 break-all text-sm text-msc-muted">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                      Class memberships
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {userMemberships.length > 0 ? (
                        userMemberships.map((membership, index) => (
                          <span
                            key={`${membership.user_id}-${membership.role_in_class}-${index}`}
                            className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-medium text-msc-ink"
                          >
                            {membership.class?.name ?? "Unknown class"} ·{" "}
                            {membership.role_in_class}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-msc-muted">No classes yet</span>
                      )}
                    </div>
                  </div>

                  <form action={updateUserRoleAction} className="space-y-2">
                    <input type="hidden" name="profileId" value={user.id} />
                    <label className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                      Change role
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="h-11 flex-1 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                      <SubmitButton size="sm" pendingText="Saving">
                        Save
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-msc-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-msc-ink">{value}</p>
    </div>
  );
}

function RolePill({ role }: { role: Profile["role"] }) {
  const classes = {
    student: "bg-sky-100 text-sky-800",
    teacher: "bg-amber-100 text-amber-800",
    admin: "bg-msc-red/10 text-msc-red",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${classes[role]}`}
    >
      {role}
    </span>
  );
}

function TestPill() {
  return (
    <span className="rounded-full bg-msc-yellow/20 px-3 py-1 text-xs font-semibold text-msc-ink">
      Test account
    </span>
  );
}

