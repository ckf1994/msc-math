"use client";

import { useActionState } from "react";
import { createGameAction } from "@/app/admin/games/actions";
import { initialContentFormState } from "@/components/admin/content-form-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatQuestionId } from "@/lib/questions/format-question-id";

type QuestionOption = {
  id: string;
  type: "mcq" | "short_answer";
  difficulty: "easy" | "medium" | "hard" | null;
  content_text: string | null;
  topic_name: string | null;
};

export function GameBuilderForm({ questions }: { questions: QuestionOption[] }) {
  const [state, formAction] = useActionState(
    createGameAction,
    initialContentFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <Feedback state={state} />

      <Field error={state.fieldErrors?.title}>
        <LabelText>Game title</LabelText>
        <input name="title" placeholder="Directed Numbers Sprint" className={fieldClassName(false)} />
      </Field>

      <Field>
        <LabelText>Description</LabelText>
        <textarea
          name="description"
          rows={3}
          placeholder="Fast-paced mini game instructions"
          className={textareaClassName(false)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field error={state.fieldErrors?.timeLimitSeconds}>
          <LabelText>Time limit (seconds)</LabelText>
          <input name="timeLimitSeconds" placeholder="300" className={fieldClassName(false)} />
        </Field>
        <CheckField name="shuffleQuestions" label="Shuffle questions" defaultChecked />
        <CheckField name="shuffleOptions" label="Shuffle options" defaultChecked />
      </div>

      <CheckField name="isPublished" label="Published and visible to students later" />

      <Field error={state.fieldErrors?.questionIds}>
        <LabelText>Choose game questions</LabelText>
        <div className="mt-2 max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-gray-100 p-3">
          {questions.map((question) => (
            <label
              key={question.id}
              className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"
            >
              <input
                type="checkbox"
                name="questionIds"
                value={question.id}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <Pill>{formatQuestionId(question.id)}</Pill>
                  <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
                  {question.difficulty ? <Pill>{question.difficulty}</Pill> : null}
                  {question.topic_name ? <Pill>{question.topic_name}</Pill> : null}
                </div>
                <p className="mt-2 text-sm text-msc-ink">
                  {question.content_text || "Image-only question"}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <SubmitButton className="w-full" pendingText="Creating game">
        Create game
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

function CheckField({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm text-msc-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
      />
      {label}
    </label>
  );
}

function LabelText({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-msc-ink">{children}</label>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
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

