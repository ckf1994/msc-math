import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  QuizzesAdminPanel,
  type ExistingQuizSet,
} from "@/components/admin/quizzes-admin-panel";
import type { QuizBuilderQuestion } from "@/components/admin/quiz-builder-form";
import type { PreviewableQuestion } from "@/components/admin/question-content-preview";

type TopicRelation =
  | {
      topic_name: string;
    }
  | {
      topic_name: string;
    }[]
  | null;

type QuestionRecord = {
  id: string;
  type: "mcq" | "short_answer";
  difficulty: "easy" | "medium" | "hard" | null;
  content_text: string | null;
  content_image_url: string | null;
  explanation_text: string | null;
  topic: TopicRelation;
  options:
    | {
        id: string;
        option_text: string | null;
        is_correct: boolean;
        sort_order: number;
      }[]
    | null;
  short_answer_rules:
    | {
        accepted_answer: string;
        answer_type: "exact" | "numeric";
        tolerance: number | null;
      }[]
    | null;
};

type QuizLinkRecord = {
  sort_order: number;
  question:
    | {
        id: string;
        type: "mcq" | "short_answer";
        difficulty: "easy" | "medium" | "hard" | null;
        content_text: string | null;
        content_image_url: string | null;
        explanation_text: string | null;
        options:
          | {
              id: string;
              option_text: string | null;
              is_correct: boolean;
              sort_order: number;
            }[]
          | null;
        short_answer_rules:
          | {
              accepted_answer: string;
              answer_type: "exact" | "numeric";
              tolerance: number | null;
            }[]
          | null;
      }
    | {
        id: string;
        type: "mcq" | "short_answer";
        difficulty: "easy" | "medium" | "hard" | null;
        content_text: string | null;
        content_image_url: string | null;
        explanation_text: string | null;
        options:
          | {
              id: string;
              option_text: string | null;
              is_correct: boolean;
              sort_order: number;
            }[]
          | null;
        short_answer_rules:
          | {
              accepted_answer: string;
              answer_type: "exact" | "numeric";
              tolerance: number | null;
            }[]
          | null;
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
  question_links: QuizLinkRecord[] | null;
};

type PageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function AdminQuizzesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: questions }, { data: quizzes }] = await Promise.all([
    supabase
      .from("questions")
      .select(`
        id,
        type,
        difficulty,
        content_text,
        content_image_url,
        explanation_text,
        topic:topics (
          topic_name
        ),
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
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        type,
        time_limit_seconds,
        is_published,
        question_links:quiz_questions (
          sort_order,
          question:questions (
            id,
            type,
            difficulty,
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
      .in("type", ["quiz", "homework"])
      .order("created_at", { ascending: false }),
  ]);

  const questionOptions: QuizBuilderQuestion[] = ((questions ?? []) as QuestionRecord[]).map(
    (question) => ({
      id: question.id,
      type: question.type,
      difficulty: question.difficulty,
      content_text: question.content_text,
      content_image_url: question.content_image_url,
      explanation_text: question.explanation_text,
      topic_name: Array.isArray(question.topic)
        ? (question.topic[0]?.topic_name ?? null)
        : (question.topic?.topic_name ?? null),
      options: question.options ?? [],
      short_answer_rules: question.short_answer_rules ?? [],
    }),
  );

  const existingQuizzes: ExistingQuizSet[] = ((quizzes ?? []) as QuizRecord[]).map(
    (quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      type: quiz.type,
      time_limit_seconds: quiz.time_limit_seconds,
      is_published: quiz.is_published,
      questions: ((quiz.question_links ?? []) as QuizLinkRecord[])
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap((link) => {
          const question = Array.isArray(link.question)
            ? (link.question[0] ?? null)
            : link.question;
          if (!question) return [];

          return [
            {
              id: question.id,
              type: question.type,
              difficulty: question.difficulty,
              content_text: question.content_text,
              content_image_url: question.content_image_url,
              explanation_text: question.explanation_text,
              options: question.options ?? [],
              short_answer_rules: question.short_answer_rules ?? [],
            } satisfies PreviewableQuestion,
          ];
        }),
    }),
  );

  const initialTab = params.tab === "existing" ? "existing" : "create";

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

      <QuizzesAdminPanel
        questions={questionOptions}
        existingQuizzes={existingQuizzes}
        initialTab={initialTab}
      />
    </div>
  );
}
