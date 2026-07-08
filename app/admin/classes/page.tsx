import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  addClassMemberAction,
  createClassAction,
  removeClassMemberAction,
} from "@/app/admin/classes/actions";
import type { Class, Profile } from "@/types/database";

type MemberRecord = {
  id: string;
  user_id: string;
  class_id: string;
  role_in_class: "student" | "teacher";
  profile: {
    full_name: string | null;
    email: string;
    role: Profile["role"];
  } | null;
};

type MembershipRow = {
  id: string;
  user_id: string;
  class_id: string;
  role_in_class: "student" | "teacher";
  profile:
    | {
        full_name: string | null;
        email: string;
        role: Profile["role"];
      }
    | {
        full_name: string | null;
        email: string;
        role: Profile["role"];
      }[]
    | null;
};

export default async function AdminClassesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: classes }, { data: profiles }, { data: memberships }] =
    await Promise.all([
      supabase
        .from("classes")
        .select("id, name, form_level, academic_year, created_at")
        .order("form_level", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("profiles")
        .select(
          "id, email, full_name, role, avatar_url, is_test_account, current_streak, longest_streak, total_xp, created_at",
        )
        .order("full_name", { ascending: true }),
      supabase.from("class_members").select(`
          id,
          user_id,
          class_id,
          role_in_class,
          profile:profiles (
            full_name,
            email,
            role
          )
        `),
    ]);

  const allClasses = (classes ?? []) as Class[];
  const allProfiles = (profiles ?? []) as Profile[];
  const allMemberships = ((memberships ?? []) as MembershipRow[]).map(
    (membership) => ({
      ...membership,
      profile: Array.isArray(membership.profile)
        ? (membership.profile[0] ?? null)
        : membership.profile,
    }),
  );

  const membershipsByClass = new Map<string, MemberRecord[]>();
  allMemberships.forEach((membership) => {
    const existing = membershipsByClass.get(membership.class_id) ?? [];
    existing.push(membership);
    membershipsByClass.set(membership.class_id, existing);
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Classes</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Start with `1A`, then create more classes later. Assign teachers and students
          from existing profiles directly in this page.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Create class</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Add a new class when you expand beyond `1A`.
            </p>

            <form action={createClassAction} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-msc-ink">Class name</label>
                <input
                  name="name"
                  placeholder="1A"
                  className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-msc-ink">Form level</label>
                <select
                  name="formLevel"
                  defaultValue="1"
                  className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                >
                  <option value="1">Form 1</option>
                  <option value="2">Form 2</option>
                  <option value="3">Form 3</option>
                  <option value="4">Form 4</option>
                  <option value="5">Form 5</option>
                  <option value="6">Form 6</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-msc-ink">Academic year</label>
                <input
                  name="academicYear"
                  defaultValue="2025-2026"
                  className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                  required
                />
              </div>

              <SubmitButton className="w-full" pendingText="Creating class">
                Create class
              </SubmitButton>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Enroll member</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Add or update a student/teacher membership in a class.
            </p>

            <form action={addClassMemberAction} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-msc-ink">Class</label>
                <select
                  name="classId"
                  className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                  required
                >
                  <option value="">Select a class</option>
                  {allClasses.map((klass) => (
                    <option key={klass.id} value={klass.id}>
                      {klass.name} · Form {klass.form_level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-msc-ink">User</label>
                <select
                  name="userId"
                  className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                  required
                >
                  <option value="">Select a user</option>
                  {allProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {(profile.full_name || profile.email) + ` · ${profile.role}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-msc-ink">Role in class</label>
                <select
                  name="roleInClass"
                  defaultValue="student"
                  className="mt-2 h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <SubmitButton className="w-full" pendingText="Saving member">
                Save membership
              </SubmitButton>
            </form>
          </div>
        </section>

        <section className="space-y-4">
          {allClasses.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-msc-muted">
                No classes found yet. Create your first class on the left.
              </p>
            </div>
          ) : (
            allClasses.map((klass) => {
              const members = membershipsByClass.get(klass.id) ?? [];
              const teachers = members.filter(
                (member) => member.role_in_class === "teacher",
              );
              const students = members.filter(
                (member) => member.role_in_class === "student",
              );

              return (
                <div
                  key={klass.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-msc-ink">
                        {klass.name}
                      </h2>
                      <p className="mt-1 text-sm text-msc-muted">
                        Form {klass.form_level} · {klass.academic_year}
                      </p>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <SummaryPill label="Teachers" value={teachers.length} />
                      <SummaryPill label="Students" value={students.length} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-2">
                    <MemberColumn
                      title="Teachers"
                      emptyText="No teachers assigned yet."
                      members={teachers}
                    />
                    <MemberColumn
                      title="Students"
                      emptyText="No students assigned yet."
                      members={students}
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-ink">
      {label}: {value}
    </span>
  );
}

function MemberColumn({
  title,
  emptyText,
  members,
}: {
  title: string;
  emptyText: string;
  members: MemberRecord[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-msc-muted">
        {title}
      </h3>
      <div className="mt-3 space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-msc-muted">{emptyText}</p>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-msc-ink">
                  {member.profile?.full_name || "Unnamed user"}
                </p>
                <p className="break-all text-sm text-msc-muted">
                  {member.profile?.email || "Unknown email"}
                </p>
              </div>

              <form action={removeClassMemberAction}>
                <input type="hidden" name="membershipId" value={member.id} />
                <SubmitButton
                  variant="outline"
                  size="sm"
                  pendingText="Removing"
                >
                  Remove
                </SubmitButton>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

