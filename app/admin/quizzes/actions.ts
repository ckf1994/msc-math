"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ContentFormState } from "@/components/admin/content-form-state";

function normalize(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function createQuizAction(
  _previousState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  try {
    const admin = await requireAdmin();
    const title = normalize(formData.get("title"));
    const description = normalize(formData.get("description"));
    const type = normalize(formData.get("type"));
    const timeLimitSeconds = parseNumber(formData.get("timeLimitSeconds"));
    const shuffleQuestions = parseBoolean(formData.get("shuffleQuestions"));
    const shuffleOptions = parseBoolean(formData.get("shuffleOptions"));
    const isPublished = parseBoolean(formData.get("isPublished"));
    const questionIds = formData
      .getAll("questionIds")
      .map((value) => String(value))
      .filter(Boolean);

    const fieldErrors: Record<string, string> = {};

    if (!title) fieldErrors.title = "Please enter a title.";
    if (type !== "quiz" && type !== "homework") {
      fieldErrors.type = "Please choose quiz or homework.";
    }
    if (timeLimitSeconds !== null && timeLimitSeconds <= 0) {
      fieldErrors.timeLimitSeconds = "Time limit must be greater than 0.";
    }
    if (questionIds.length === 0) {
      fieldErrors.questionIds = "Please choose at least one question.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors,
      };
    }

    const supabase = await createClient();
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title,
        description,
        type,
        time_limit_seconds: timeLimitSeconds,
        shuffle_questions: shuffleQuestions,
        shuffle_options: shuffleOptions,
        is_published: isPublished,
        created_by: admin.id,
      })
      .select("id")
      .single();

    if (quizError || !quiz) {
      return {
        status: "error",
        message: `Failed to create quiz: ${quizError?.message ?? "Unknown error"}`,
      };
    }

    const { error: linkError } = await supabase.from("quiz_questions").insert(
      questionIds.map((questionId, index) => ({
        quiz_id: quiz.id,
        question_id: questionId,
        sort_order: index,
      })),
    );

    if (linkError) {
      return {
        status: "error",
        message: `Failed to attach questions: ${linkError.message}`,
      };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/quizzes");

    return {
      status: "success",
      message: `${type === "homework" ? "Homework" : "Quiz"} created successfully.`,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the quiz.",
    };
  }
}

