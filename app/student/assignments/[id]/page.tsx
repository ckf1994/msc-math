import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ActivityRunner } from "@/components/student/activity-runner";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentAssignmentDetailPage({ params }: PageProps) {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const { id } = await params;
  const supabase = await createClient();
  const { data: assignment } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      instructions,
      quiz:quizzes (
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
      )
    `)
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  const quiz = Array.isArray(assignment.quiz) ? assignment.quiz[0] : assignment.quiz;
  if (!quiz) notFound();

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
      assignmentId={assignment.id}
      title={assignment.title}
      description={assignment.instructions || quiz.description}
      questions={questions}
    />
  );
}

