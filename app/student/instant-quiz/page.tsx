import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { createInstantQuizAction } from "@/app/student/instant-quiz/actions";
import { ActivityRunner } from "@/components/student/activity-runner";

type PageProps = {
  searchParams: Promise<{ quizId?: string; mode?: string; error?: string }>;
};

export default async function StudentInstantQuizPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const params = await searchParams;
  const supabase = await createClient();

  if (params.quizId) {
    const { data: quiz } = await supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        questions:quiz_questions (
          sort_order,
          question:questions (
            id,
            type,
            content_text,
            content_image_url,
            explanation_text,
            options:question_options (
              id,
              option_text,
              is_correct,
              sort_order
            ),
            short_answer_rules (
              accepted_answer,
              answer_type,
              tolerance
            )
          )
        )
      `)
      .eq("id", params.quizId)
      .single();

    if (quiz) {
      const questions = (quiz.questions ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((link) => {
          const question = Array.isArray(link.question) ? link.question[0] : link.question;
          return question
            ? {
                ...question,
                options: question.options ?? [],
                short_answer_rules: question.short_answer_rules ?? [],
              }
            : null;
        })
        .filter((question): question is NonNullable<typeof question> => question !== null);

      return (
        <ActivityRunner
          quizId={quiz.id}
          title={params.mode === "practice" ? "Practice Session" : "Instant Quiz"}
          description={quiz.description}
          questions={questions}
        />
      );
    }
  }

  const { data: topics } = await supabase
    .from("topics")
    .select("form_level")
    .order("form_level", { ascending: true });

  const forms = Array.from(new Set((topics ?? []).map((topic) => topic.form_level))).sort();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Instant Quiz</h1>
      </div>

      {params.error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          No matching questions were found. Try a different filter.
        </div>
      ) : null}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <form action={createInstantQuizAction} className="grid gap-4 sm:grid-cols-2">
          <select name="formLevel" className={fieldClassName()}>
            <option value="">Any form</option>
            {forms.map((formLevel) => (
              <option key={formLevel} value={String(formLevel)}>
                {`F.${formLevel}`}
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
            Generate quiz
          </button>
        </form>
      </section>
    </div>
  );
}

function fieldClassName() {
  return "h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink";
}

