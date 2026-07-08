import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { createAssignmentAction } from "@/app/teacher/actions";

export default async function TeacherAssignPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "teacher") redirect("/");

  const supabase = await createClient();
  const [{ data: classes }, { data: quizzes }, { data: assignments }] = await Promise.all([
    supabase
      .from("class_members")
      .select("class:classes ( id, name, form_level )")
      .eq("user_id", profile.id)
      .eq("role_in_class", "teacher"),
    supabase
      .from("quizzes")
      .select("id, title, type, is_published")
      .in("type", ["quiz", "homework", "game"])
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("assignments")
      .select("id, title, due_at, class:classes ( name ), quiz:quizzes ( title )")
      .eq("assigned_by", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const teacherClasses = (classes ?? [])
    .map((row) => (Array.isArray(row.class) ? row.class[0] : row.class))
    .filter(Boolean) as { id: string; name: string; form_level: number }[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Teacher tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Assign Work</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">Create assignment</h2>
          <form action={createAssignmentAction} className="mt-5 space-y-4">
            <Field label="Title">
              <input name="title" placeholder="1A Week 1 Homework" className={fieldClassName()} />
            </Field>
            <Field label="Class">
              <select name="classId" className={fieldClassName()}>
                <option value="">Select class</option>
                {teacherClasses.map((klass) => (
                  <option key={klass.id} value={klass.id}>
                    {klass.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Content">
              <select name="quizId" className={fieldClassName()}>
                <option value="">Select quiz/homework/game</option>
                {(quizzes ?? []).map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {`${quiz.title} · ${quiz.type}`}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due at">
              <input name="dueAt" type="datetime-local" className={fieldClassName()} />
            </Field>
            <Field label="Instructions">
              <textarea
                name="instructions"
                rows={4}
                placeholder="Optional instructions for students"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-msc-ink"
              />
            </Field>
            <label className="flex items-center gap-3 text-sm text-msc-ink">
              <input
                type="checkbox"
                name="allowComments"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300"
              />
              Allow student comments
            </label>
            <button className="h-11 w-full rounded-xl bg-msc-red px-5 text-sm font-semibold text-white">
              Create assignment
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Recent assignments</h2>
          </div>
          {(assignments ?? []).length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-msc-muted">No assignments yet.</p>
            </div>
          ) : (
            (assignments ?? []).map((assignment) => {
              const klass = Array.isArray(assignment.class)
                ? assignment.class[0]
                : assignment.class;
              const quiz = Array.isArray(assignment.quiz)
                ? assignment.quiz[0]
                : assignment.quiz;
              return (
                <article
                  key={assignment.id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-msc-ink">{assignment.title}</h3>
                  <p className="mt-2 text-sm text-msc-muted">
                    {klass?.name || "Unknown class"} · {quiz?.title || "Unknown content"}
                  </p>
                  {assignment.due_at ? (
                    <p className="mt-2 text-sm text-msc-muted">
                      Due: {new Date(assignment.due_at).toLocaleString()}
                    </p>
                  ) : null}
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-msc-ink">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function fieldClassName() {
  return "h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink";
}

