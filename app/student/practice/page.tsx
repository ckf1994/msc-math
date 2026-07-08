import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { createPracticeQuizAction } from "@/app/student/practice/actions";

export default async function StudentPracticePage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data: topics } = await supabase
    .from("topics")
    .select("id, form_level, chapter_name, topic_name")
    .order("form_level", { ascending: true })
    .order("chapter_name", { ascending: true })
    .order("topic_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Practice</h1>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-msc-ink">Generate practice</h2>
        <form action={createPracticeQuizAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <select name="topicId" className={fieldClassName()}>
            <option value="">Any topic</option>
            {(topics ?? []).map((topic) => (
              <option key={topic.id} value={topic.id}>
                {`F.${topic.form_level} · ${topic.chapter_name} · ${topic.topic_name}`}
              </option>
            ))}
          </select>
          <select name="difficulty" className={fieldClassName()}>
            <option value="">Any difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input name="count" defaultValue="5" className={fieldClassName()} />
          <button className="h-11 rounded-xl bg-msc-red px-5 text-sm font-semibold text-white">
            Start practice
          </button>
        </form>
      </section>
    </div>
  );
}

function fieldClassName() {
  return "h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink";
}

