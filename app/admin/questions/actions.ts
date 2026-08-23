"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Difficulty, QuestionType } from "@/types/database";
import type {
  CreateQuestionState,
  CreateQuestionValues,
} from "@/components/question-bank/question-form-state";

const QUESTION_ASSETS_BUCKET = "question-assets";

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function captureFormValues(formData: FormData): CreateQuestionValues {
  const typeValue = normalize(formData.get("type"));
  const answerTypeValue = normalize(formData.get("answerType"));

  return {
    formLevel: readString(formData, "formLevel"),
    chapterName: readString(formData, "chapterName"),
    topicId: readString(formData, "topicId"),
    difficulty: readString(formData, "difficulty"),
    type: typeValue === "short_answer" ? "short_answer" : "mcq",
    pastPaper: readString(formData, "pastPaper"),
    pastPaperYear: readString(formData, "pastPaperYear"),
    contentText: readString(formData, "contentText"),
    explanationText: readString(formData, "explanationText"),
    optionText0: readString(formData, "optionText0"),
    optionText1: readString(formData, "optionText1"),
    optionText2: readString(formData, "optionText2"),
    optionText3: readString(formData, "optionText3"),
    optionImageUrl0: readString(formData, "optionImageUrl0"),
    optionImageUrl1: readString(formData, "optionImageUrl1"),
    optionImageUrl2: readString(formData, "optionImageUrl2"),
    optionImageUrl3: readString(formData, "optionImageUrl3"),
    optionCorrect0: parseBoolean(formData.get("optionCorrect0")),
    optionCorrect1: parseBoolean(formData.get("optionCorrect1")),
    optionCorrect2: parseBoolean(formData.get("optionCorrect2")),
    optionCorrect3: parseBoolean(formData.get("optionCorrect3")),
    acceptedAnswers: readString(formData, "acceptedAnswers"),
    answerType: answerTypeValue === "numeric" ? "numeric" : "exact",
    tolerance: readString(formData, "tolerance"),
    isActive: parseBoolean(formData.get("isActive")),
  };
}

function errorState(
  values: CreateQuestionValues,
  message: string,
  fieldErrors?: Record<string, string>,
): CreateQuestionState {
  return {
    status: "error",
    message,
    fieldErrors,
    values,
  };
}

function normalize(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function normalizeOptionText(value: FormDataEntryValue | null) {
  if (value == null) return null;
  const text = String(value);
  if (text.length === 0) return null;
  // Keep whitespace-only values (e.g. a single space) as intentional blank option text.
  return text.trim().length === 0 ? " " : text.trim();
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

function parseOptionalPastPaper(
  value: FormDataEntryValue | null,
): "MSC" | "DSE" | "HKCEE" | "HKAE" | "other" | null {
  const pastPaper = normalize(value);
  if (!pastPaper) return null;
  return pastPaper === "MSC" ||
    pastPaper === "DSE" ||
    pastPaper === "HKCEE" ||
    pastPaper === "HKAE" ||
    pastPaper === "other"
    ? pastPaper
    : null;
}

function parseOptionalPastPaperYear(value: FormDataEntryValue | null): number | null {
  const normalized = normalize(value);
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2026 ? parsed : null;
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
  const values = captureFormValues(formData);

  try {
    const admin = await requireAdmin();

    const topicId = normalize(formData.get("topicId"));
    const formLevel = parseOptionalFormLevel(formData.get("formLevel"));
    const chapterName = normalize(formData.get("chapterName"));
    const difficulty = parseOptionalDifficulty(formData.get("difficulty"));
    const pastPaper = parseOptionalPastPaper(formData.get("pastPaper"));
    const pastPaperYear = parseOptionalPastPaperYear(formData.get("pastPaperYear"));
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

    if (normalize(formData.get("pastPaper")) && pastPaper === null) {
      fieldErrors.pastPaper = "Please choose a valid past paper source.";
    }

    if (pastPaper && pastPaperYear === null) {
      fieldErrors.pastPaperYear = "Please choose a year for this past paper.";
    }

    if (!pastPaper && normalize(formData.get("pastPaperYear"))) {
      fieldErrors.pastPaperYear = "Choose a past paper source before choosing a year.";
    }

    if (chapterName && !formLevel) {
      fieldErrors.chapterName = "Choose a form before choosing a chapter.";
    }

    if (!contentText && !contentImageFile) {
      fieldErrors.contentText =
        "Please enter question text or upload a question image.";
    }

    const rawOptions = [0, 1, 2, 3].map((index) => ({
      label: String.fromCharCode(65 + index),
      option_text: normalizeOptionText(formData.get(`optionText${index}`)),
      option_image_url: normalize(formData.get(`optionImageUrl${index}`)),
      is_correct: parseBoolean(formData.get(`optionCorrect${index}`)),
      sort_order: index,
    }));

    const optionValues = rawOptions.filter(
      (option) => option.option_text || option.option_image_url,
    );

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
      const emptyOptions = rawOptions.filter(
        (option) => !option.option_text && !option.option_image_url,
      );

      if (emptyOptions.length > 0) {
        fieldErrors.mcqOptions = `Please fill in option content for ${emptyOptions
          .map((option) => option.label)
          .join(", ")}. Each option needs text or an image URL.`;
      } else if (optionValues.length < 2) {
        fieldErrors.mcqOptions = "MCQ questions need at least 2 options.";
      }

      if (
        optionValues.length > 0 &&
        !optionValues.some((option) => option.is_correct) &&
        !fieldErrors.mcqOptions
      ) {
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
      return errorState(
        values,
        "Please fix the highlighted fields and try again.",
        fieldErrors,
      );
    }

    const supabase = await createClient();

    if (topicId) {
      const { data: topicRecord, error: topicError } = await supabase
        .from("topics")
        .select("id, form_level, chapter_name")
        .eq("id", topicId)
        .single();

      if (topicError || !topicRecord) {
        return errorState(values, "Please choose a valid topic.", {
          topicId: "Selected topic was not found.",
        });
      }

      if (formLevel !== null && topicRecord.form_level !== formLevel) {
        return errorState(
          values,
          "The selected topic does not match the chosen form.",
          { topicId: "Selected topic does not belong to this form." },
        );
      }

      if (chapterName && topicRecord.chapter_name !== chapterName) {
        return errorState(
          values,
          "The selected topic does not match the chosen chapter.",
          { topicId: "Selected topic does not belong to this chapter." },
        );
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
          pastPaper,
          pastPaperYear: pastPaper ? pastPaperYear : null,
        },
        created_by: admin.id,
        is_active: isActive,
      })
      .select("id")
      .single();

    if (questionError || !question) {
      return errorState(
        values,
        `Failed to create question: ${questionError?.message ?? "Unknown error"}`,
      );
    }

    if (type === "mcq") {
      const { error: optionError } = await supabase.from("question_options").insert(
        optionValues.map((option) => ({
          question_id: question.id,
          option_text: option.option_text,
          option_image_url: option.option_image_url,
          is_correct: option.is_correct,
          sort_order: option.sort_order,
        })),
      );

      if (optionError) {
        return errorState(values, `Failed to save options: ${optionError.message}`);
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
        return errorState(
          values,
          `Failed to save accepted answers: ${ruleError.message}`,
        );
      }
    }

    revalidatePath("/admin/questions");
    revalidatePath("/admin/questions/list");

    return {
      status: "success",
      message: "Question created successfully.",
      completedAt: Date.now(),
    };
  } catch (error) {
    return errorState(
      values,
      error instanceof Error
        ? error.message
        : "Something went wrong while creating the question.",
    );
  }
}

