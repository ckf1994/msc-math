import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { StudentQuizPreview } from "@/components/admin/student-quiz-preview";

type PageProps = {
  params: Promise<{ id: string }>;
};

type QuizQuestionLink = {
  sort_order: number;
  question:
    | {
        id: string;
        type: "mcq" | "short_answer";
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

export default async function AdminQuizPreviewPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`
      title,
      description,
      type,
      time_limit_seconds,
      links:quiz_questions (
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
    .eq("id", id)
    .in("type", ["quiz", "homework"])
    .single();

  if (!quiz) notFound();

  const questions = ((quiz.links ?? []) as QuizQuestionLink[])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => {
      const question = Array.isArray(link.question)
        ? (link.question[0] ?? null)
        : link.question;
      return question
        ? {
            ...question,
            options: question.options ?? [],
            short_answer_rules: question.short_answer_rules ?? [],
          }
        : null;
    })
    .filter(isPreviewQuestion);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/quizzes?tab=existing"
        className="inline-flex items-center gap-2 text-sm font-medium text-msc-muted hover:text-msc-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to quizzes
      </Link>

      <StudentQuizPreview
        quiz={{
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          time_limit_seconds: quiz.time_limit_seconds,
        }}
        questions={questions}
      />
    </div>
  );
}

function isPreviewQuestion<T>(value: T | null): value is T {
  return value !== null;
}

