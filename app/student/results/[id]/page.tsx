import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { formatQuestionId } from "@/lib/questions/format-question-id";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentResultDetailPage({ params }: PageProps) {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const { id } = await params;
  const supabase = await createClient();
  const { data: attempt } = await supabase
    .from("attempts")
    .select(`
      id,
      score,
      max_score,
      xp_earned,
      completed_at,
      quiz:quizzes ( title ),
      answers:attempt_answers (
        text_answer,
        is_correct,
        selected_option_id,
        question:questions (
          id,
          content_text
        )
      )
    `)
    .eq("id", id)
    .eq("user_id", profile.id)
    .single();

  if (!attempt) notFound();

  const quiz = Array.isArray(attempt.quiz) ? attempt.quiz[0] : attempt.quiz;
  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-msc-yellow/30 bg-msc-yellow/10 p-6">
        <h1 className="text-2xl font-bold text-msc-ink">{quiz?.title || "Result"}</h1>
        <p className="mt-2 text-sm text-msc-muted">
          Score {attempt.score}/{attempt.max_score} · XP earned {attempt.xp_earned}
        </p>
      </section>

      {answers.map((answer, index) => {
        const question = Array.isArray(answer.question) ? answer.question[0] : answer.question;
        return (
          <article
            key={`${attempt.id}-${index}`}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {question?.id ? <Pill>{formatQuestionId(question.id)}</Pill> : null}
              <Pill>{answer.is_correct ? "Correct" : "Incorrect"}</Pill>
            </div>
            <p className="mt-4 text-sm text-msc-ink">{question?.content_text || "Question"}</p>
            <p className="mt-2 text-sm text-msc-muted">
              Your answer: {answer.text_answer || answer.selected_option_id || "No answer"}
            </p>
          </article>
        );
      })}
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
