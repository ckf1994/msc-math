"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createBadgeAction,
  updateBadgeAction,
} from "@/app/admin/badges/actions";
import {
  initialContentFormState,
  type ContentFormState,
} from "@/components/admin/content-form-state";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

export type EditableBadge = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  criteria_type: "streak" | "score" | "completion" | "custom";
  criteria_value: Record<string, unknown>;
  xp_reward: number;
};

type BadgeFormProps = {
  badge?: EditableBadge | null;
  onCancelEdit?: () => void;
  onSaved?: () => void;
};

function criteriaTargetValue(badge: EditableBadge | null | undefined) {
  if (!badge) return "";
  const value = badge.criteria_value;
  if (badge.criteria_type === "streak") {
    return String(value.streak_days ?? "");
  }
  if (badge.criteria_type === "score") {
    return String(value.min_score ?? "");
  }
  if (badge.criteria_type === "completion") {
    return String(
      value.completions_required ?? value.quizzes_completed ?? "",
    );
  }
  return "";
}

function customCriteriaNotes(badge: EditableBadge | null | undefined) {
  if (!badge || badge.criteria_type !== "custom") return "";
  return String(badge.criteria_value.notes ?? "");
}

export function BadgeForm({ badge, onCancelEdit, onSaved }: BadgeFormProps) {
  const isEditing = Boolean(badge);
  const action = isEditing ? updateBadgeAction : createBadgeAction;
  const [state, formAction] = useActionState(action, initialContentFormState);
  const [criteriaType, setCriteriaType] = useState<
    "streak" | "score" | "completion" | "custom"
  >(badge?.criteria_type ?? "completion");
  const [formKey, setFormKey] = useState(badge?.id ?? "create");

  useEffect(() => {
    setCriteriaType(badge?.criteria_type ?? "completion");
    setFormKey(badge?.id ?? "create");
  }, [badge]);

  useEffect(() => {
    if (state.status === "success") {
      onSaved?.();
      if (!isEditing) {
        setFormKey(`create-${Date.now()}`);
        setCriteriaType("completion");
      }
    }
  }, [state, isEditing, onSaved]);

  return (
    <form key={formKey} action={formAction} className="space-y-5">
      {badge ? <input type="hidden" name="badgeId" value={badge.id} /> : null}
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={state.fieldErrors?.name}>
          <LabelText>Badge name</LabelText>
          <input
            name="name"
            defaultValue={badge?.name ?? ""}
            placeholder="Speed Star"
            className={fieldClassName(Boolean(state.fieldErrors?.name))}
          />
        </Field>
        <Field error={state.fieldErrors?.criteriaType}>
          <LabelText>Criteria type</LabelText>
          <select
            name="criteriaType"
            value={criteriaType}
            onChange={(event) =>
              setCriteriaType(
                event.target.value as "streak" | "score" | "completion" | "custom",
              )
            }
            className={fieldClassName(Boolean(state.fieldErrors?.criteriaType))}
          >
            <option value="completion">Completion</option>
            <option value="streak">Streak</option>
            <option value="score">Score</option>
            <option value="custom">Custom</option>
          </select>
        </Field>
      </div>

      <Field>
        <LabelText>Description</LabelText>
        <textarea
          name="description"
          rows={3}
          defaultValue={badge?.description ?? ""}
          placeholder="What does students need to achieve?"
          className={textareaClassName(false)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        {criteriaType === "custom" ? (
          <Field error={state.fieldErrors?.customCriteria}>
            <LabelText>Custom criteria</LabelText>
            <textarea
              name="customCriteria"
              rows={3}
              defaultValue={customCriteriaNotes(badge)}
              placeholder="Describe the badge rule for admin reference"
              className={textareaClassName(
                Boolean(state.fieldErrors?.customCriteria),
              )}
            />
          </Field>
        ) : (
          <Field error={state.fieldErrors?.targetValue}>
            <LabelText>Target value</LabelText>
            <input
              name="targetValue"
              defaultValue={criteriaTargetValue(badge)}
              placeholder={
                criteriaType === "streak"
                  ? "7"
                  : criteriaType === "score"
                    ? "90"
                    : "1"
              }
              className={fieldClassName(Boolean(state.fieldErrors?.targetValue))}
            />
          </Field>
        )}

        <Field error={state.fieldErrors?.xpReward}>
          <LabelText>XP reward</LabelText>
          <input
            name="xpReward"
            defaultValue={String(badge?.xp_reward ?? 50)}
            className={fieldClassName(Boolean(state.fieldErrors?.xpReward))}
          />
        </Field>
      </div>

      <Field error={state.fieldErrors?.imageFile}>
        <LabelText>{isEditing ? "Replace badge image" : "Badge image"}</LabelText>
        {badge?.image_url ? (
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={badge.image_url}
              alt={badge.name}
              className="h-16 w-16 rounded-xl object-contain"
            />
            <p className="text-xs text-msc-muted">
              Current image. Upload a new file only if you want to replace it.
            </p>
          </div>
        ) : null}
        <input
          type="file"
          name="imageFile"
          accept="image/*"
          className={fileClassName(Boolean(state.fieldErrors?.imageFile))}
        />
        <p className="mt-2 text-xs text-msc-muted">
          {isEditing
            ? "Optional. Leave empty to keep the current image."
            : "Optional. Upload a badge icon now or replace it later."}
        </p>
      </Field>

      <div className="flex flex-col gap-2 sm:flex-row">
        <SubmitButton
          className="w-full sm:flex-1"
          pendingText={isEditing ? "Saving badge" : "Creating badge"}
        >
          {isEditing ? "Save changes" : "Create badge"}
        </SubmitButton>
        {isEditing && onCancelEdit ? (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancelEdit}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Feedback({ state }: { state: ContentFormState }) {
  if (!state.message) return null;
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm ${
        state.status === "success"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </div>
  );
}

function Field({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      {children}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function LabelText({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-msc-ink">{children}</label>;
}

function fieldClassName(hasError: boolean) {
  return `mt-2 h-11 w-full rounded-xl border-2 bg-white px-3 text-sm text-msc-ink outline-none focus:ring-2 focus:ring-msc-red/10 ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-msc-red/50"
  }`;
}

function textareaClassName(hasError: boolean) {
  return `mt-2 w-full rounded-xl border-2 px-4 py-3 text-sm text-msc-ink outline-none focus:ring-2 focus:ring-msc-red/10 ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-msc-red/50"
  }`;
}

function fileClassName(hasError: boolean) {
  return `mt-2 block w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-msc-ink file:mr-4 file:rounded-lg file:border-0 file:bg-msc-red file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-msc-red-dark ${
    hasError
      ? "border-red-300 focus:border-red-400"
      : "border-gray-200 focus:border-msc-red/50"
  } focus:ring-2 focus:ring-msc-red/10`;
}
