import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { QuizBuilderForm } from "@/components/admin/quiz-builder-form";

type QuestionRecord = {
  id: string;
  type: "mcq" | "short_answer";
  difficulty: "easy" | "medium" | "hard" | null;
  content_text: string | null;
  topic:
    | {
        topic_name: string;
      }
    | {
        topic_name: string;
      }[]
    | null;
};

type QuizRecord = {
  id: string;
  title: string;
  description: string | null;
  type: "quiz" | "homework" | "game";
  time_limit_seconds: number | null;
  is_published: boolean;
  question_links: { id: string }[] | null;
};

export default async function AdminQuizzesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: questions }, { data: quizzes }] = await Promise.all([
    supabase.from("questions").select(`
      id,
      type,
      difficulty,
      content_text,
      topic:topics (
        topic_name
      )
    `).eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("quizzes").select(`
      id,
      title,
      description,
      type,
      time_limit_seconds,
      is_published,
      question_links:quiz_questions (
        id
      )
    `).in("type", ["quiz", "homework"]).order("created_at", { ascending: false }),
  ]);

  const questionOptions = ((questions ?? []) as QuestionRecord[]).map((question) => ({
    ...question,
    topic_name: Array.isArray(question.topic)
      ? (question.topic[0]?.topic_name ?? null)
      : (question.topic?.topic_name ?? null),
  }));

  const existingQuizzes = (quizzes ?? []) as QuizRecord[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Quizzes & Homework</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Build timed quizzes or homework sets from the question bank. Teachers will
          assign these in the next section.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">Create content</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Choose whether the content behaves like a quiz or homework.
          </p>
          <div className="mt-5">
            <QuizBuilderForm questions={questionOptions} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Existing sets</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Review published and draft quizzes before assigning them.
            </p>
          </div>

          {existingQuizzes.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-msc-muted">No quizzes or homework sets yet.</p>
            </div>
          ) : (
            existingQuizzes.map((quiz) => (
              <article
                key={quiz.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{quiz.type}</Pill>
                  <Pill>{quiz.is_published ? "Published" : "Draft"}</Pill>
                  <Pill>{`${quiz.question_links?.length ?? 0} questions`}</Pill>
                  {quiz.time_limit_seconds ? (
                    <Pill>{`${quiz.time_limit_seconds}s`}</Pill>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-msc-ink">{quiz.title}</h3>
                {quiz.description ? (
                  <p className="mt-2 text-sm text-msc-muted">{quiz.description}</p>
                ) : null}
                <div className="mt-4">
                  <Link
                    href={`/admin/quizzes/${quiz.id}/preview`}
                    className="text-sm font-semibold text-msc-red"
                  >
                    Preview as student
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
}

