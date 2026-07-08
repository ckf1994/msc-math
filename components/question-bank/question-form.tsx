"use client";

import { useActionState, useMemo, useState } from "react";
import { createQuestionAction } from "@/app/admin/questions/actions";
import { initialCreateQuestionState } from "@/components/question-bank/question-form-state";
import { SubmitButton } from "@/components/ui/submit-button";

type TopicRecord = {
  id: string;
  form_level: number;
  chapter_name: string;
  topic_name: string;
  sort_order: number;
};

export function QuestionForm({ topics }: { topics: TopicRecord[] }) {
  const [state, formAction] = useActionState(
    createQuestionAction,
    initialCreateQuestionState,
  );
  const [questionType, setQuestionType] = useState<"mcq" | "short_answer">(
    "mcq",
  );
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const formOptions = useMemo(
    () => Array.from(new Set(topics.map((topic) => topic.form_level))).sort(),
    [topics],
  );

  const chapterOptions = useMemo(() => {
    if (!selectedForm) return [];
    return Array.from(
      new Set(
        topics
          .filter((topic) => String(topic.form_level) === selectedForm)
          .map((topic) => topic.chapter_name),
      ),
    ).sort();
  }, [selectedForm, topics]);

  const topicOptions = useMemo(() => {
    return topics.filter((topic) => {
      const matchesForm = !selectedForm || String(topic.form_level) === selectedForm;
      const matchesChapter = !selectedChapter || topic.chapter_name === selectedChapter;
      return matchesForm && matchesChapter;
    });
  }, [selectedChapter, selectedForm, topics]);

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            state.status === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={state.fieldErrors?.formLevel}>
          <LabelText>Form (optional)</LabelText>
          <select
            name="formLevel"
            value={selectedForm}
            onChange={(event) => {
              setSelectedForm(event.target.value);
              setSelectedChapter("");
            }}
            className={fieldClassName(Boolean(state.fieldErrors?.formLevel))}
          >
            <option value="">No form selected</option>
            {formOptions.map((formLevel) => (
              <option key={formLevel} value={String(formLevel)}>
                {`F.${formLevel}`}
              </option>
            ))}
          </select>
        </Field>

        <Field error={state.fieldErrors?.chapterName}>
          <LabelText>Chapter (optional)</LabelText>
          <select
            name="chapterName"
            value={selectedChapter}
            onChange={(event) => setSelectedChapter(event.target.value)}
            className={fieldClassName(Boolean(state.fieldErrors?.chapterName))}
            disabled={!selectedForm}
          >
            <option value="">No chapter selected</option>
            {chapterOptions.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field error={state.fieldErrors?.topicId}>
        <LabelText>Topic (optional)</LabelText>
        <select
          name="topicId"
          className={fieldClassName(Boolean(state.fieldErrors?.topicId))}
          disabled={!selectedForm || !selectedChapter}
          defaultValue=""
        >
          <option value="">No topic selected</option>
          {topicOptions.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.topic_name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={state.fieldErrors?.difficulty}>
          <LabelText>Difficulty (optional)</LabelText>
          <select
            name="difficulty"
            defaultValue=""
            className={fieldClassName(Boolean(state.fieldErrors?.difficulty))}
          >
            <option value="">No difficulty selected</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </Field>

        <Field error={state.fieldErrors?.type}>
          <LabelText>Question type</LabelText>
          <select
            name="type"
            value={questionType}
            onChange={(event) =>
              setQuestionType(event.target.value as "mcq" | "short_answer")
            }
            className={fieldClassName(Boolean(state.fieldErrors?.type))}
          >
            <option value="mcq">Multiple choice</option>
            <option value="short_answer">Short answer</option>
          </select>
        </Field>
      </div>

      <Field error={state.fieldErrors?.contentText}>
        <LabelText>Question text</LabelText>
        <textarea
          name="contentText"
          rows={4}
          placeholder="Enter the question text"
          className={textareaClassName(Boolean(state.fieldErrors?.contentText))}
        />
      </Field>

      <Field error={state.fieldErrors?.contentImageFile}>
        <LabelText>Question image</LabelText>
        <input
          type="file"
          name="contentImageFile"
          accept="image/*"
          className={fileClassName(Boolean(state.fieldErrors?.contentImageFile))}
        />
        <p className="mt-2 text-xs text-msc-muted">
          Optional. JPG, PNG, GIF, or WebP up to 5MB.
        </p>
      </Field>

      <Field>
        <LabelText>Explanation</LabelText>
        <textarea
          name="explanationText"
          rows={3}
          placeholder="Explain how students should solve it"
          className={textareaClassName(false)}
        />
      </Field>

      <Field error={state.fieldErrors?.explanationImageFile}>
        <LabelText>Explanation image</LabelText>
        <input
          type="file"
          name="explanationImageFile"
          accept="image/*"
          className={fileClassName(Boolean(state.fieldErrors?.explanationImageFile))}
        />
      </Field>

      {questionType === "mcq" ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-msc-ink">MCQ options</h3>
          <p className="mt-1 text-sm text-msc-muted">
            Only shown for multiple choice questions.
          </p>
          {state.fieldErrors?.mcqOptions ? (
            <p className="mt-2 text-sm text-red-600">{state.fieldErrors.mcqOptions}</p>
          ) : null}
          {state.fieldErrors?.mcqCorrect ? (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.mcqCorrect}</p>
          ) : null}

          <div className="mt-4 space-y-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-msc-ink">
                    Option {String.fromCharCode(65 + index)}
                  </p>
                  <label className="flex items-center gap-2 text-sm text-msc-muted">
                    <input
                      type="checkbox"
                      name={`optionCorrect${index}`}
                      className="h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
                    />
                    Correct
                  </label>
                </div>
                <input
                  name={`optionText${index}`}
                  placeholder="Option text"
                  className={`${fieldClassName(false)} mt-3`}
                />
                <input
                  name={`optionImageUrl${index}`}
                  placeholder="Option image URL (optional)"
                  className={`${fieldClassName(false)} mt-3`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-msc-ink">Short answer rules</h3>
          <p className="mt-1 text-sm text-msc-muted">
            Only shown for short answer questions.
          </p>

          <Field error={state.fieldErrors?.acceptedAnswers}>
            <textarea
              name="acceptedAnswers"
              rows={4}
              placeholder={"42\n42.0"}
              className={`${textareaClassName(Boolean(state.fieldErrors?.acceptedAnswers))} mt-4`}
            />
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field error={state.fieldErrors?.answerType}>
              <LabelText>Answer rule type</LabelText>
              <select
                name="answerType"
                defaultValue="exact"
                className={fieldClassName(Boolean(state.fieldErrors?.answerType))}
              >
                <option value="exact">Exact</option>
                <option value="numeric">Numeric</option>
              </select>
            </Field>

            <Field error={state.fieldErrors?.tolerance}>
              <LabelText>Numeric tolerance</LabelText>
              <input
                name="tolerance"
                placeholder="e.g. 0.1"
                className={fieldClassName(Boolean(state.fieldErrors?.tolerance))}
              />
            </Field>
          </div>
        </div>
      )}

      <label className="flex items-center gap-3 text-sm text-msc-ink">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked
          className="h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
        />
        Active question
      </label>

      <SubmitButton className="w-full" pendingText="Creating question">
        Create question
      </SubmitButton>
    </form>
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

