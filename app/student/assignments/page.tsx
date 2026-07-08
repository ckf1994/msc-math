import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentAssignmentsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("class_members")
    .select(`
      class:classes (
        assignments (
          id,
          title,
          due_at,
          quiz:quizzes ( title, type )
        )
      )
    `)
    .eq("user_id", profile.id)
    .eq("role_in_class", "student");

  const assignments = (data ?? []).flatMap((row) => {
    const klass = Array.isArray(row.class) ? row.class[0] : row.class;
    return Array.isArray(klass?.assignments) ? klass.assignments : [];
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Assignments</h1>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">No assignments yet.</p>
        </div>
      ) : (
        assignments.map((assignment) => {
          const quiz = Array.isArray(assignment.quiz) ? assignment.quiz[0] : assignment.quiz;
          return (
            <article
              key={assignment.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Pill>{quiz?.type || "assignment"}</Pill>
                {assignment.due_at ? (
                  <Pill>{`Due ${new Date(assignment.due_at).toLocaleDateString()}`}</Pill>
                ) : null}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-msc-ink">{assignment.title}</h2>
              <p className="mt-2 text-sm text-msc-muted">{quiz?.title || "Untitled content"}</p>
              <Link
                href={`/student/assignments/${assignment.id}`}
                className="mt-4 inline-block text-sm font-semibold text-msc-red"
              >
                Open assignment
              </Link>
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

