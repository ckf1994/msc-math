import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  McqOptionStatsPanel,
  summarizeMcqStats,
  type McqQuestionStats,
} from "@/components/admin/mcq-option-stats";

type QuestionRow = {
  id: string;
  content_text: string | null;
  content_image_url: string | null;
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
    content_image_url: question.content_image_url,
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

export default async function AdminMcqInsightsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: questions } = await supabase
    .from("questions")
    .select(`
      id,
      content_text,
      content_image_url,
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
    .order("created_at", { ascending: false });

  const mcqQuestions = ((questions ?? []) as QuestionRow[])
    .map(mapQuestion)
    .sort((a, b) => {
      const totalA = summarizeMcqStats(a.options).total;
      const totalB = summarizeMcqStats(b.options).total;
      return totalB - totalA;
    });

  const withData = mcqQuestions.filter(
    (question) => summarizeMcqStats(question.options).total > 0,
  );
  const lowCorrect = withData
    .map((question) => ({
      question,
      summary: summarizeMcqStats(question.options),
    }))
    .filter((item) => item.summary.correctRate !== null && item.summary.correctRate < 60)
    .sort((a, b) => (a.summary.correctRate ?? 0) - (b.summary.correctRate ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-2 text-sm font-medium text-msc-muted hover:text-msc-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to question bank
        </Link>
        <p className="mt-4 text-sm text-msc-muted">Question bank</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">MCQ option insights</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Live A/B/C/D selection rates from every student submission — assignments,
          practice, instant quizzes, and games.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active MCQs" value={mcqQuestions.length} />
        <StatCard label="With student data" value={withData.length} />
        <StatCard label="Low correct rate (<60%)" value={lowCorrect.length} />
      </div>

      {lowCorrect.length > 0 ? (
        <section className="rounded-2xl border border-msc-yellow/40 bg-msc-yellow/10 p-5">
          <h2 className="text-lg font-semibold text-msc-ink">Common struggle questions</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Lowest correct rates — useful for spotting common mistakes.
          </p>
          <div className="mt-4 space-y-4">
            {lowCorrect.map(({ question, summary }) => (
              <div
                key={question.id}
                className="rounded-2xl border border-white/70 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-msc-ink">
                  {summary.correctRate}% correct · {summary.total} submissions
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-msc-muted">
                  {question.content_text || "Image-only question"}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        {mcqQuestions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-msc-muted">No active MCQ questions yet.</p>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-msc-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-msc-ink">{value}</p>
    </div>
  );
}
