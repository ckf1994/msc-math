"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuizAction } from "@/app/admin/quizzes/actions";
import { initialContentFormState } from "@/components/admin/content-form-state";
import {
  QuestionContentPreview,
  type PreviewableQuestion,
} from "@/components/admin/question-content-preview";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatQuestionId } from "@/lib/questions/format-question-id";

export type QuizBuilderQuestion = PreviewableQuestion;

export function QuizBuilderForm({
  questions,
}: {
  questions: QuizBuilderQuestion[];
}) {
  const [state, formAction] = useActionState(
    createQuizAction,
    initialContentFormState,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const questionsById = useMemo(
    () => new Map(questions.map((question) => [question.id, question])),
    [questions],
  );

  const selectedQuestions = selectedIds
    .map((id) => questionsById.get(id))
    .filter((question): question is QuizBuilderQuestion => Boolean(question));

  function toggleQuestion(questionId: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(questionId) ? current : [...current, questionId];
      }
      return current.filter((id) => id !== questionId);
    });
  }

  return (
    <form action={formAction} className="w-full space-y-5">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={state.fieldErrors?.title}>
          <LabelText>Title</LabelText>
          <input
            name="title"
            placeholder="Form 1 Quiz 1"
            className={fieldClassName(false)}
          />
        </Field>

        <Field error={state.fieldErrors?.type}>
          <LabelText>Type</LabelText>
          <select name="type" defaultValue="quiz" className={fieldClassName(false)}>
            <option value="quiz">Quiz</option>
            <option value="homework">Homework</option>
          </select>
        </Field>
      </div>

      <Field>
        <LabelText>Description</LabelText>
        <textarea
          name="description"
          rows={3}
          placeholder="Short instructions for this quiz"
          className={textareaClassName(false)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field error={state.fieldErrors?.timeLimitSeconds}>
          <LabelText>Time limit (seconds)</LabelText>
          <input
            name="timeLimitSeconds"
            placeholder="600"
            className={fieldClassName(false)}
          />
        </Field>
        <CheckField name="shuffleQuestions" label="Shuffle questions" defaultChecked />
        <CheckField name="shuffleOptions" label="Shuffle options" defaultChecked />
      </div>

      <CheckField name="isPublished" label="Published and ready to assign" />

      <Field error={state.fieldErrors?.questionIds}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <LabelText>Choose questions</LabelText>
            <p className="mt-1 text-xs text-msc-muted">
              Preview each question below and check the ones to include.
            </p>
          </div>
          {selectedQuestions.length > 0 ? (
            <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-ink">
              {selectedQuestions.length} selected
            </span>
          ) : null}
        </div>

        {selectedQuestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedQuestions.map((question, index) => (
              <span
                key={question.id}
                className="rounded-full bg-msc-red px-3 py-1 text-xs font-semibold text-white"
              >
                {index + 1}. {formatQuestionId(question.id)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-3 space-y-4">
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <p className="text-sm text-msc-muted">
                No active questions in the bank yet.
              </p>
            </div>
          ) : (
            questions.map((question) => {
              const checked = selectedIds.includes(question.id);
              const selectedOrder = checked
                ? selectedIds.indexOf(question.id) + 1
                : null;

              return (
                <label
                  key={question.id}
                  className={`block cursor-pointer rounded-2xl border p-4 transition ${
                    checked
                      ? "border-msc-red/40 bg-msc-red/5 shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="questionIds"
                      value={question.id}
                      checked={checked}
                      onChange={(event) =>
                        toggleQuestion(question.id, event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedOrder ? (
                          <span className="rounded-full bg-msc-red px-2.5 py-1 text-xs font-semibold text-white">
                            #{selectedOrder}
                          </span>
                        ) : null}
                        <Pill>{formatQuestionId(question.id)}</Pill>
                        <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
                        {question.difficulty ? <Pill>{question.difficulty}</Pill> : null}
                        {question.topic_name ? <Pill>{question.topic_name}</Pill> : null}
                      </div>

                      <div className="mt-3">
                        <QuestionContentPreview
                          question={question}
                          framed={false}
                          hideMeta
                        />
                      </div>
                    </div>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </Field>

      <SubmitButton className="w-full" pendingText="Creating quiz">
        Create quiz
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
