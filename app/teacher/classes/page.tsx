import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

type TeacherClass = {
  id: string;
  name: string;
  form_level: number;
  academic_year: string;
  members:
    | {
        role_in_class: "student" | "teacher";
        profile:
          | {
              full_name: string | null;
              email: string;
            }
          | {
              full_name: string | null;
              email: string;
            }[]
          | null;
      }[]
    | null;
  assignments: { id: string }[] | null;
};

export default async function TeacherClassesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "teacher") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("class_members")
    .select(`
      class:classes (
        id,
        name,
        form_level,
        academic_year,
        members:class_members (
          role_in_class,
          profile:profiles (
            full_name,
            email
          )
        ),
        assignments (
          id
        )
      )
    `)
    .eq("user_id", profile.id)
    .eq("role_in_class", "teacher");

  const classes = (data ?? [])
    .map((row) => (Array.isArray(row.class) ? row.class[0] : row.class))
    .filter(Boolean) as TeacherClass[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Teacher tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">My Classes</h1>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">You are not assigned to any class yet.</p>
        </div>
      ) : (
        classes.map((klass) => {
          const students = (klass.members ?? []).filter(
            (member) => member.role_in_class === "student",
          );
          return (
            <article
              key={klass.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{klass.name}</Pill>
                <Pill>{`F.${klass.form_level}`}</Pill>
                <Pill>{`${students.length} students`}</Pill>
                <Pill>{`${klass.assignments?.length ?? 0} assignments`}</Pill>
              </div>
              <p className="mt-4 text-sm text-msc-muted">{klass.academic_year}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {students.map((student, index) => {
                  const person = Array.isArray(student.profile)
                    ? student.profile[0]
                    : student.profile;
                  return (
                    <div
                      key={`${klass.id}-student-${index}`}
                      className="rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <p className="font-medium text-msc-ink">
                        {person?.full_name || "Unnamed student"}
                      </p>
                      <p className="text-sm text-msc-muted">{person?.email || "No email"}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-ink">
      {children}
    </span>
  );
}

