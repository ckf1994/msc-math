"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Difficulty, QuestionType } from "@/types/database";
import type { CreateQuestionState } from "@/components/question-bank/question-form-state";

const QUESTION_ASSETS_BUCKET = "question-assets";

function normalize(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!value.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  if (value.size > 5 * 1024 * 1024) {
    throw new Error("Image files must be 5MB or smaller.");
  }

  return value;
}

async function uploadQuestionAsset(file: File, folder: "questions" | "explanations") {
  const supabase = await createClient();
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "png";
  const filePath = `${folder}/${randomUUID()}.${extension || "png"}`;

  const { error } = await supabase.storage
    .from(QUESTION_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Image upload failed: ${error.message}. Make sure the '${QUESTION_ASSETS_BUCKET}' bucket is set up in Supabase.`,
    );
  }

  const { data } = supabase.storage
    .from(QUESTION_ASSETS_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function parseOptionalDifficulty(value: FormDataEntryValue | null): Difficulty | null {
  const difficulty = normalize(value);
  if (!difficulty) return null;
  return difficulty === "easy" || difficulty === "medium" || difficulty === "hard"
    ? difficulty
    : null;
}

function parseQuestionType(value: FormDataEntryValue | null): QuestionType | null {
  const type = normalize(value);
  if (!type) return null;
  return type === "mcq" || type === "short_answer" ? type : null;
}

function parseOptionalFormLevel(value: FormDataEntryValue | null): number | null {
  const normalized = normalize(value);
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 6 ? parsed : null;
}

export async function createQuestionAction(
  _previousState: CreateQuestionState,
  formData: FormData,
): Promise<CreateQuestionState> {
  try {
    const admin = await requireAdmin();

    const topicId = normalize(formData.get("topicId"));
    const formLevel = parseOptionalFormLevel(formData.get("formLevel"));
    const chapterName = normalize(formData.get("chapterName"));
    const difficulty = parseOptionalDifficulty(formData.get("difficulty"));
    const type = parseQuestionType(formData.get("type"));
    const contentText = normalize(formData.get("contentText"));
    const explanationText = normalize(formData.get("explanationText"));
    const isActive = parseBoolean(formData.get("isActive"));
    const fieldErrors: Record<string, string> = {};

    let contentImageFile: File | null = null;
    let explanationImageFile: File | null = null;

    try {
      contentImageFile = getFile(formData.get("contentImageFile"));
    } catch (error) {
      fieldErrors.contentImageFile =
        error instanceof Error ? error.message : "Invalid question image.";
    }

    try {
      explanationImageFile = getFile(formData.get("explanationImageFile"));
    } catch (error) {
      fieldErrors.explanationImageFile =
        error instanceof Error ? error.message : "Invalid explanation image.";
    }

    if (!type) {
      fieldErrors.type = "Please choose a question type.";
    }

    if (normalize(formData.get("formLevel")) && formLevel === null) {
      fieldErrors.formLevel = "Please choose a valid form.";
    }

    if (chapterName && !formLevel) {
      fieldErrors.chapterName = "Choose a form before choosing a chapter.";
    }

    if (!contentText && !contentImageFile) {
      fieldErrors.contentText =
        "Please enter question text or upload a question image.";
    }

    const optionValues = [0, 1, 2, 3]
      .map((index) => ({
        option_text: normalize(formData.get(`optionText${index}`)),
        option_image_url: normalize(formData.get(`optionImageUrl${index}`)),
        is_correct: parseBoolean(formData.get(`optionCorrect${index}`)),
        sort_order: index,
      }))
      .filter((option) => option.option_text || option.option_image_url);

    const acceptedAnswersRaw = normalize(formData.get("acceptedAnswers"));
    const answerType = normalize(formData.get("answerType")) ?? "exact";
    const tolerance = parseNumber(formData.get("tolerance"));
    const acceptedAnswers = acceptedAnswersRaw
      ? acceptedAnswersRaw
          .split("\n")
          .map((answer) => answer.trim())
          .filter(Boolean)
      : [];

    if (type === "mcq") {
      if (optionValues.length < 2) {
        fieldErrors.mcqOptions = "MCQ questions need at least 2 options.";
      }

      if (optionValues.length > 0 && !optionValues.some((option) => option.is_correct)) {
        fieldErrors.mcqCorrect = "Please mark at least one correct option.";
      }
    }

    if (type === "short_answer") {
      if (acceptedAnswers.length === 0) {
        fieldErrors.acceptedAnswers =
          "Please provide at least one accepted answer.";
      }

      if (answerType !== "exact" && answerType !== "numeric") {
        fieldErrors.answerType = "Invalid short-answer rule type.";
      }

      if (answerType === "numeric" && tolerance !== null && tolerance < 0) {
        fieldErrors.tolerance = "Tolerance cannot be negative.";
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors,
      };
    }

    const supabase = await createClient();

    if (topicId) {
      const { data: topicRecord, error: topicError } = await supabase
        .from("topics")
        .select("id, form_level, chapter_name")
        .eq("id", topicId)
        .single();

      if (topicError || !topicRecord) {
        return {
          status: "error",
          message: "Please choose a valid topic.",
          fieldErrors: { topicId: "Selected topic was not found." },
        };
      }

      if (formLevel !== null && topicRecord.form_level !== formLevel) {
        return {
          status: "error",
          message: "The selected topic does not match the chosen form.",
          fieldErrors: { topicId: "Selected topic does not belong to this form." },
        };
      }

      if (chapterName && topicRecord.chapter_name !== chapterName) {
        return {
          status: "error",
          message: "The selected topic does not match the chosen chapter.",
          fieldErrors: {
            topicId: "Selected topic does not belong to this chapter.",
          },
        };
      }
    }

    const [contentImageUrl, explanationImageUrl] = await Promise.all([
      contentImageFile ? uploadQuestionAsset(contentImageFile, "questions") : null,
      explanationImageFile
        ? uploadQuestionAsset(explanationImageFile, "explanations")
        : null,
    ]);

    const { data: question, error: questionError } = await supabase
      .from("questions")
      .insert({
        topic_id: topicId,
        difficulty,
        type,
        content_text: contentText,
        content_image_url: contentImageUrl,
        explanation_text: explanationText,
        explanation_image_url: explanationImageUrl,
        metadata: {
          formLevel,
          chapterName,
        },
        created_by: admin.id,
        is_active: isActive,
      })
      .select("id")
      .single();

    if (questionError || !question) {
      return {
        status: "error",
        message: `Failed to create question: ${questionError?.message ?? "Unknown error"}`,
      };
    }

    if (type === "mcq") {
      const { error: optionError } = await supabase.from("question_options").insert(
        optionValues.map((option) => ({
          question_id: question.id,
          ...option,
        })),
      );

      if (optionError) {
        return {
          status: "error",
          message: `Failed to save options: ${optionError.message}`,
        };
      }
    }

    if (type === "short_answer") {
      const { error: ruleError } = await supabase.from("short_answer_rules").insert(
        acceptedAnswers.map((answer) => ({
          question_id: question.id,
          accepted_answer: answer,
          answer_type: answerType,
          tolerance: answerType === "numeric" ? tolerance : null,
        })),
      );

      if (ruleError) {
        return {
          status: "error",
          message: `Failed to save accepted answers: ${ruleError.message}`,
        };
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/questions");
    revalidatePath("/admin/questions/list");

    return {
      status: "success",
      message: "Question created successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the question.",
    };
  }
}

