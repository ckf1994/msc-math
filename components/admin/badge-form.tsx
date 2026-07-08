"use client";

import { useActionState, useState } from "react";
import { createBadgeAction } from "@/app/admin/badges/actions";
import { initialContentFormState } from "@/components/admin/content-form-state";
import { SubmitButton } from "@/components/ui/submit-button";

export function BadgeForm() {
  const [state, formAction] = useActionState(
    createBadgeAction,
    initialContentFormState,
  );
  const [criteriaType, setCriteriaType] = useState<
    "streak" | "score" | "completion" | "custom"
  >("completion");

  return (
    <form action={formAction} className="space-y-5">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={state.fieldErrors?.name}>
          <LabelText>Badge name</LabelText>
          <input name="name" placeholder="Speed Star" className={fieldClassName(false)} />
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
            className={fieldClassName(false)}
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
              placeholder="Describe the badge rule for admin reference"
              className={textareaClassName(false)}
            />
          </Field>
        ) : (
          <Field error={state.fieldErrors?.targetValue}>
            <LabelText>Target value</LabelText>
            <input
              name="targetValue"
              placeholder={
                criteriaType === "streak"
                  ? "7"
                  : criteriaType === "score"
                    ? "90"
                    : "1"
              }
              className={fieldClassName(false)}
            />
          </Field>
        )}

        <Field error={state.fieldErrors?.xpReward}>
          <LabelText>XP reward</LabelText>
          <input name="xpReward" defaultValue="50" className={fieldClassName(false)} />
        </Field>
      </div>

      <Field error={state.fieldErrors?.imageFile}>
        <LabelText>Badge image</LabelText>
        <input
          type="file"
          name="imageFile"
          accept="image/*"
          className={fileClassName(Boolean(state.fieldErrors?.imageFile))}
        />
        <p className="mt-2 text-xs text-msc-muted">
          Optional. Upload a badge icon now or replace it later.
        </p>
      </Field>

      <SubmitButton className="w-full" pendingText="Creating badge">
        Create badge
      </SubmitButton>
    </form>
  );
}

function Feedback({
  state,
}: {
  state: { status: "idle" | "success" | "error"; message?: string };
}) {
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

