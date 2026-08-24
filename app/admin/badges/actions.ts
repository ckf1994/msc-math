"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ContentFormState } from "@/components/admin/content-form-state";

const BADGE_ASSETS_BUCKET = "badge-assets";

type CriteriaType = "streak" | "score" | "completion" | "custom";

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

function getFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  if (!value.type.startsWith("image/")) {
    throw new Error("Please upload a valid badge image.");
  }
  if (value.size > 5 * 1024 * 1024) {
    throw new Error("Badge images must be 5MB or smaller.");
  }
  return value;
}

function isCriteriaType(value: string | null): value is CriteriaType {
  return (
    value === "streak" ||
    value === "score" ||
    value === "completion" ||
    value === "custom"
  );
}

function buildCriteriaValue(
  criteriaType: CriteriaType,
  targetValue: number | null,
  customCriteria: string | null,
) {
  if (criteriaType === "custom") {
    return { notes: customCriteria };
  }
  if (criteriaType === "streak") {
    return { streak_days: targetValue };
  }
  if (criteriaType === "score") {
    return { min_score: targetValue };
  }
  return { completions_required: targetValue };
}

function parseBadgeFields(formData: FormData) {
  const name = normalize(formData.get("name"));
  const description = normalize(formData.get("description"));
  const criteriaType = normalize(formData.get("criteriaType"));
  const xpReward = parseNumber(formData.get("xpReward")) ?? 0;
  const targetValue = parseNumber(formData.get("targetValue"));
  const customCriteria = normalize(formData.get("customCriteria"));

  const fieldErrors: Record<string, string> = {};
  let imageFile: File | null = null;
  try {
    imageFile = getFile(formData.get("imageFile"));
  } catch (error) {
    fieldErrors.imageFile =
      error instanceof Error ? error.message : "Invalid badge image.";
  }

  if (!name) fieldErrors.name = "Please enter a badge name.";
  if (!isCriteriaType(criteriaType)) {
    fieldErrors.criteriaType = "Please choose a valid badge type.";
  }
  if (xpReward < 0) fieldErrors.xpReward = "XP reward cannot be negative.";

  if (criteriaType === "custom" && !customCriteria) {
    fieldErrors.customCriteria = "Please describe the custom badge criteria.";
  }

  if (
    (criteriaType === "streak" ||
      criteriaType === "score" ||
      criteriaType === "completion") &&
    (targetValue === null || targetValue < 0)
  ) {
    fieldErrors.targetValue = "Please enter a valid target value.";
  }

  return {
    name,
    description,
    criteriaType,
    xpReward,
    targetValue,
    customCriteria,
    imageFile,
    fieldErrors,
  };
}

async function uploadBadgeAsset(file: File) {
  const supabase = await createClient();
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "png";
  const filePath = `badges/${randomUUID()}.${extension || "png"}`;

  const { error } = await supabase.storage
    .from(BADGE_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Badge image upload failed: ${error.message}. Make sure the '${BADGE_ASSETS_BUCKET}' bucket is set up in Supabase.`,
    );
  }

  const { data } = supabase.storage
    .from(BADGE_ASSETS_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function revalidateBadgePaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/badges");
  revalidatePath("/student/badges");
}

export async function createBadgeAction(
  _previousState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  try {
    await requireAdmin();

    const fields = parseBadgeFields(formData);
    if (Object.keys(fields.fieldErrors).length > 0 || !isCriteriaType(fields.criteriaType)) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: fields.fieldErrors,
      };
    }

    const imageUrl = fields.imageFile
      ? await uploadBadgeAsset(fields.imageFile)
      : null;

    const supabase = await createClient();
    const { error } = await supabase.from("badges").insert({
      name: fields.name,
      description: fields.description,
      image_url: imageUrl,
      criteria_type: fields.criteriaType,
      criteria_value: buildCriteriaValue(
        fields.criteriaType,
        fields.targetValue,
        fields.customCriteria,
      ),
      xp_reward: fields.xpReward,
    });

    if (error) {
      return {
        status: "error",
        message: `Failed to create badge: ${error.message}`,
      };
    }

    revalidateBadgePaths();

    return {
      status: "success",
      message: "Badge created successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the badge.",
    };
  }
}

export async function updateBadgeAction(
  _previousState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  try {
    await requireAdmin();

    const badgeId = normalize(formData.get("badgeId"));
    if (!badgeId) {
      return {
        status: "error",
        message: "Missing badge id.",
      };
    }

    const fields = parseBadgeFields(formData);
    if (Object.keys(fields.fieldErrors).length > 0 || !isCriteriaType(fields.criteriaType)) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: fields.fieldErrors,
      };
    }

    const supabase = await createClient();
    const { data: existing, error: existingError } = await supabase
      .from("badges")
      .select("id, image_url")
      .eq("id", badgeId)
      .single();

    if (existingError || !existing) {
      return {
        status: "error",
        message: "Badge not found.",
      };
    }

    const imageUrl = fields.imageFile
      ? await uploadBadgeAsset(fields.imageFile)
      : existing.image_url;

    const { error } = await supabase
      .from("badges")
      .update({
        name: fields.name,
        description: fields.description,
        image_url: imageUrl,
        criteria_type: fields.criteriaType,
        criteria_value: buildCriteriaValue(
          fields.criteriaType,
          fields.targetValue,
          fields.customCriteria,
        ),
        xp_reward: fields.xpReward,
      })
      .eq("id", badgeId);

    if (error) {
      return {
        status: "error",
        message: `Failed to update badge: ${error.message}`,
      };
    }

    revalidateBadgePaths();

    return {
      status: "success",
      message: "Badge updated successfully.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the badge.",
    };
  }
}
