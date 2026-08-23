import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import {
  McqOptionStatsPanel,
  summarizeMcqStats,
  type McqQuestionStats,
} from "@/components/admin/mcq-option-stats";

type QuestionRow = {
  id: string;
  content_text: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  topic:
    | { topic_name: string }
    | { topic_name: string }[]
    | null;
  options:
    | {
        id: string;
        option_text: string | null;
        is_correct: boolean;
        sort_order: number;
        stats:
          | { selection_count: number | null }
          | { selection_count: number | null }[]
          | null;
      }[]
    | null;
};

function mapQuestion(question: QuestionRow): McqQuestionStats {
  return {
    id: question.id,
    content_text: question.content_text,
    difficulty: question.difficulty,
    topic_name: Array.isArray(question.topic)
      ? (question.topic[0]?.topic_name ?? null)
      : (question.topic?.topic_name ?? null),
    options: (question.options ?? []).map((option) => {
      const stats = Array.isArray(option.stats) ? option.stats[0] : option.stats;
      return {
        id: option.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        sort_order: option.sort_order,
        selection_count: stats?.selection_count ?? 0,
      };
    }),
  };
}

export default async function TeacherAnalyticsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "teacher") redirect("/");

  const supabase = await createClient();
  const [{ data: assignments }, { data: questions }] = await Promise.all([
    supabase
      .from("assignments")
      .select(`
        id,
        title,
        class:classes ( name ),
        attempts (
          score,
          max_score
        )
      `)
      .eq("assigned_by", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("questions")
      .select(`
        id,
        content_text,
        difficulty,
        topic:topics (
          topic_name
        ),
        options:question_options (
          id,
          option_text,
          is_correct,
          sort_order,
          stats:question_option_stats (
            selection_count
          )
        )
      `)
      .eq("type", "mcq")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  const mcqQuestions = ((questions ?? []) as QuestionRow[])
    .map(mapQuestion)
    .map((question) => ({
      question,
      summary: summarizeMcqStats(question.options),
    }))
    .filter((item) => item.summary.total > 0)
    .sort((a, b) => b.summary.total - a.summary.total)
    .slice(0, 12)
    .map((item) => item.question);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Teacher tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Assignment results plus live MCQ option rates to spot common mistakes.
        </p>
      </div>

      <section className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">Assignments</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Submission counts and average scores for work you assigned.
          </p>
        </div>

        {(assignments ?? []).length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-msc-muted">
              Assign some work to see assignment analytics here.
            </p>
          </div>
        ) : (
          (assignments ?? []).map((assignment) => {
            const attempts = Array.isArray(assignment.attempts)
              ? assignment.attempts
              : [];
            const totalPercent = attempts.reduce((sum, attempt) => {
              if (!attempt.max_score) return sum;
              return sum + (attempt.score / attempt.max_score) * 100;
            }, 0);
            const averageScore =
              attempts.length > 0 ? Math.round(totalPercent / attempts.length) : 0;
            const klass = Array.isArray(assignment.class)
              ? assignment.class[0]
              : assignment.class;

            return (
              <article
                key={assignment.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap gap-2">
                  <Pill>{klass?.name || "Unknown class"}</Pill>
                  <Pill>{`${attempts.length} submissions`}</Pill>
                  <Pill>{`${averageScore}% avg`}</Pill>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-msc-ink">
                  {assignment.title}
                </h3>
              </article>
            );
          })
        )}
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">MCQ option insights</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Live A/B/C/D selection percentages from all student activity on the
            platform (not only your assignments).
          </p>
        </div>

        {mcqQuestions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-msc-muted">
              No MCQ selection data yet. Stats appear after students submit answers.
            </p>
          </div>
        ) : (
          mcqQuestions.map((question) => (
            <article
              key={question.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <McqOptionStatsPanel question={question} />
            </article>
          ))
        )}
      </section>
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
