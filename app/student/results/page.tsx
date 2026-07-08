import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentResultsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data: attempts } = await supabase
    .from("attempts")
    .select(`
      id,
      score,
      max_score,
      completed_at,
      quiz:quizzes ( title )
    `)
    .eq("user_id", profile.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Results</h1>
      </div>

      {(attempts ?? []).length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">No completed attempts yet.</p>
        </div>
      ) : (
        (attempts ?? []).map((attempt) => {
          const quiz = Array.isArray(attempt.quiz) ? attempt.quiz[0] : attempt.quiz;
          const percent = attempt.max_score ? Math.round((attempt.score / attempt.max_score) * 100) : 0;
          return (
            <article
              key={attempt.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Pill>{`${attempt.score}/${attempt.max_score}`}</Pill>
                <Pill>{`${percent}%`}</Pill>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-msc-ink">{quiz?.title || "Quiz"}</h2>
              {attempt.completed_at ? (
                <p className="mt-2 text-sm text-msc-muted">
                  {new Date(attempt.completed_at).toLocaleString()}
                </p>
              ) : null}
              <Link
                href={`/student/results/${attempt.id}`}
                className="mt-4 inline-block text-sm font-semibold text-msc-red"
              >
                Review result
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

