"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";

type SubmittedAnswer = {
  questionId: string;
  selectedOptionId?: string | null;
  textAnswer?: string | null;
  timeSpentSeconds?: number;
};

type CompletionPayload = {
  quizId: string;
  assignmentId?: string | null;
  answers: SubmittedAnswer[];
  startedAt: string;
};

export async function completeActivityAction(payload: CompletionPayload) {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") {
    throw new Error("Only students can submit attempts.");
  }

  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id")
    .eq("id", payload.quizId)
    .single();

  if (!quiz) {
    throw new Error("Quiz not found.");
  }

  const questionIds = payload.answers.map((answer) => answer.questionId);
  const { data: questions, error: questionError } = await supabase
    .from("questions")
    .select(`
      id,
      type,
      options:question_options (
        id,
        is_correct
      ),
      short_answer_rules (
        accepted_answer,
        answer_type,
        tolerance
      )
    `)
    .in("id", questionIds);

  if (questionError || !questions) {
    throw new Error(`Failed to grade attempt: ${questionError?.message ?? "Unknown error"}`);
  }

  const questionMap = new Map(
    questions.map((question) => [
      question.id,
      {
        type: question.type as "mcq" | "short_answer",
        options: (question.options ?? []) as { id: string; is_correct: boolean }[],
        shortAnswerRules: (question.short_answer_rules ?? []) as {
          accepted_answer: string;
          answer_type: "exact" | "numeric";
          tolerance: number | null;
        }[],
      },
    ]),
  );

  let score = 0;
  const gradedAnswers = payload.answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    let isCorrect = false;

    if (question?.type === "mcq") {
      const option = question.options.find(
        (candidate) => candidate.id === answer.selectedOptionId,
      );
      isCorrect = option?.is_correct === true;
    } else if (question?.type === "short_answer") {
      const submitted = (answer.textAnswer ?? "").trim();
      isCorrect = question.shortAnswerRules.some((rule) => {
        if (rule.answer_type === "numeric") {
          const submittedNumber = Number(submitted);
          const expectedNumber = Number(rule.accepted_answer);
          if (!Number.isFinite(submittedNumber) || !Number.isFinite(expectedNumber)) {
            return false;
          }
          const tolerance = rule.tolerance ?? 0;
          return Math.abs(submittedNumber - expectedNumber) <= tolerance;
        }
        return submitted.toLowerCase() === rule.accepted_answer.trim().toLowerCase();
      });
    }

    if (isCorrect) score += 1;

    return {
      ...answer,
      isCorrect,
    };
  });

  const maxScore = gradedAnswers.length;
  const xpEarned = score * 10 + (score === maxScore && maxScore > 0 ? 20 : 0);

  const startedAt = new Date(payload.startedAt);
  const completedAt = new Date();
  const timeSpentSeconds = Math.max(
    0,
    Math.round((completedAt.getTime() - startedAt.getTime()) / 1000),
  );

  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .insert({
      user_id: profile.id,
      quiz_id: payload.quizId,
      assignment_id: payload.assignmentId ?? null,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      time_spent_seconds: timeSpentSeconds,
      score,
      max_score: maxScore,
      xp_earned: xpEarned,
      status: "completed",
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    throw new Error(`Failed to save attempt: ${attemptError?.message ?? "Unknown error"}`);
  }

  const { error: answersError } = await supabase.from("attempt_answers").insert(
    gradedAnswers.map((answer) => ({
      attempt_id: attempt.id,
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId ?? null,
      text_answer: answer.textAnswer ?? null,
      is_correct: answer.isCorrect,
      time_spent_seconds: answer.timeSpentSeconds ?? null,
    })),
  );

  if (answersError) {
    throw new Error(`Failed to save answers: ${answersError.message}`);
  }

  const previousTotalXp = profile.total_xp;
  const nextTotalXp = previousTotalXp + xpEarned;
  const now = new Date();
  const { data: previousAttempt } = await supabase
    .from("attempts")
    .select("completed_at")
    .eq("user_id", profile.id)
    .neq("id", attempt.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentDay = new Date(now.toDateString()).getTime();
  const lastCompletedDay = previousAttempt?.completed_at
    ? new Date(new Date(previousAttempt.completed_at).toDateString()).getTime()
    : null;
  const oneDayMs = 24 * 60 * 60 * 1000;

  let currentStreak = 1;
  if (lastCompletedDay !== null) {
    if (currentDay === lastCompletedDay) {
      currentStreak = profile.current_streak;
    } else if (currentDay - lastCompletedDay === oneDayMs) {
      currentStreak = profile.current_streak + 1;
    }
  }

  const longestStreak = Math.max(profile.longest_streak, currentStreak);

  await supabase
    .from("profiles")
    .update({
      total_xp: nextTotalXp,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    })
    .eq("id", profile.id);

  const { data: badges } = await supabase
    .from("badges")
    .select("id, criteria_type, criteria_value")
    .order("created_at", { ascending: true });

  const { count: completedAttemptsCount } = await supabase
    .from("attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("status", "completed");

  for (const badge of badges ?? []) {
    const criteria = (badge.criteria_value ?? {}) as Record<string, unknown>;
    let earned = false;

    if (badge.criteria_type === "completion") {
      const required =
        Number(criteria.quizzes_completed ?? criteria.completions_required ?? 0) || 0;
      earned = (completedAttemptsCount ?? 0) >= required;
    } else if (badge.criteria_type === "streak") {
      const required = Number(criteria.streak_days ?? 0) || 0;
      earned = currentStreak >= required;
    } else if (badge.criteria_type === "score") {
      const required = Number(criteria.min_score ?? 0) || 0;
      const percent = maxScore > 0 ? (score / maxScore) * 100 : 0;
      earned = percent >= required;
    }

    if (earned) {
      await supabase.from("user_badges").upsert(
        {
          user_id: profile.id,
          badge_id: badge.id,
        },
        { onConflict: "user_id,badge_id" },
      );
    }
  }

  revalidatePath("/student");
  revalidatePath("/student/assignments");
  revalidatePath("/student/results");
  revalidatePath("/student/report");
  revalidatePath("/student/leaderboard");
  revalidatePath("/student/badges");
  revalidatePath("/teacher");
  revalidatePath("/teacher/classes");
  revalidatePath("/teacher/analytics");

  return {
    attemptId: attempt.id,
    score,
    maxScore,
    xpEarned,
  };
}

export async function addAssignmentCommentAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) {
    throw new Error("You must be signed in.");
  }

  const assignmentId = String(formData.get("assignmentId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!assignmentId || !content) {
    throw new Error("Comment cannot be empty.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("assignment_comments").insert({
    assignment_id: assignmentId,
    user_id: profile.id,
    content,
  });

  if (error) {
    throw new Error(`Failed to post comment: ${error.message}`);
  }

  revalidatePath("/student/assignments");
  revalidatePath("/teacher/classes");
}

