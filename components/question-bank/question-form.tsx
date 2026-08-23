"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createQuestionAction } from "@/app/admin/questions/actions";
import {
  emptyCreateQuestionValues,
  initialCreateQuestionState,
  type CreateQuestionValues,
} from "@/components/question-bank/question-form-state";
import { SubmitButton } from "@/components/ui/submit-button";

type TopicRecord = {
  id: string;
  form_level: number;
  chapter_name: string;
  topic_name: string;
  sort_order: number;
};

export function QuestionForm({ topics }: { topics: TopicRecord[] }) {
  const [state, formAction, isPending] = useActionState(
    createQuestionAction,
    initialCreateQuestionState,
  );
  const [values, setValues] = useState<CreateQuestionValues>(() => ({
    ...emptyCreateQuestionValues,
  }));
  const [contentImageName, setContentImageName] = useState<string | null>(null);
  const [explanationImageName, setExplanationImageName] = useState<string | null>(
    null,
  );
  const handledSuccessRef = useRef<string | null>(null);

  // Controlled fields already keep values on validation errors.
  // Only reset + scroll after a successful create, once per success result.
  useEffect(() => {
    if (state.status !== "success" || !state.completedAt) {
      return;
    }

    if (handledSuccessRef.current === String(state.completedAt)) return;
    handledSuccessRef.current = String(state.completedAt);

    setValues({ ...emptyCreateQuestionValues });
    setContentImageName(null);
    setExplanationImageName(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.status, state.completedAt]);

  const formOptions = [1, 2, 3, 4, 5, 6];
  const pastPaperYearOptions = useMemo(
    () => Array.from({ length: 2026 - 2000 + 1 }, (_, index) => 2026 - index),
    [],
  );

  const chapterOptions = useMemo(() => {
    if (!values.formLevel) return [];
    const byChapter = new Map<string, number>();
    for (const topic of topics) {
      if (String(topic.form_level) !== values.formLevel) continue;
      const existing = byChapter.get(topic.chapter_name);
      if (existing === undefined || topic.sort_order < existing) {
        byChapter.set(topic.chapter_name, topic.sort_order);
      }
    }
    return Array.from(byChapter.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([name]) => name);
  }, [topics, values.formLevel]);

  const topicOptions = useMemo(() => {
    return topics
      .filter((topic) => {
        const matchesForm =
          !values.formLevel || String(topic.form_level) === values.formLevel;
        const matchesChapter =
          !values.chapterName || topic.chapter_name === values.chapterName;
        return matchesForm && matchesChapter;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [topics, values.chapterName, values.formLevel]);

  function updateValue<K extends keyof CreateQuestionValues>(
    key: K,
    value: CreateQuestionValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleFormChange(formLevel: string) {
    setValues((current) => ({
      ...current,
      formLevel,
      chapterName: "",
      topicId: "",
    }));
  }

  function handleChapterChange(chapterName: string) {
    setValues((current) => ({
      ...current,
      chapterName,
      topicId: "",
    }));
  }

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
          {state.status === "error" &&
          (contentImageName || explanationImageName) ? (
            <p className="mt-2 text-xs">
              Please re-select any uploaded images before submitting again.
            </p>
          ) : null}
        </div>
      ) : null}

      <Field error={state.fieldErrors?.formLevel}>
        <LabelText>Form</LabelText>
        <input type="hidden" name="formLevel" value={values.formLevel} />
        <PillGroup>
          <PillOption
            selected={values.formLevel === ""}
            onClick={() => handleFormChange("")}
          >
            None
          </PillOption>
          {formOptions.map((formLevel) => (
            <PillOption
              key={formLevel}
              selected={values.formLevel === String(formLevel)}
              onClick={() => handleFormChange(String(formLevel))}
            >
              {`F.${formLevel}`}
            </PillOption>
          ))}
        </PillGroup>
      </Field>

      <Field error={state.fieldErrors?.chapterName}>
        <LabelText>Chapter</LabelText>
        <input type="hidden" name="chapterName" value={values.chapterName} />
        <PillGroup>
          <PillOption
            selected={values.chapterName === ""}
            onClick={() => handleChapterChange("")}
            disabled={!values.formLevel}
          >
            None
          </PillOption>
          {values.formLevel ? (
            chapterOptions.map((chapter) => (
              <PillOption
                key={chapter}
                selected={values.chapterName === chapter}
                onClick={() => handleChapterChange(chapter)}
              >
                {chapter}
              </PillOption>
            ))
          ) : (
            <p className="px-1 py-2 text-xs text-msc-muted">
              Choose a form first to see chapters.
            </p>
          )}
        </PillGroup>
      </Field>

      <Field error={state.fieldErrors?.topicId}>
        <LabelText>Topic</LabelText>
        <input type="hidden" name="topicId" value={values.topicId} />
        <PillGroup>
          <PillOption
            selected={values.topicId === ""}
            onClick={() => updateValue("topicId", "")}
            disabled={!values.formLevel || !values.chapterName}
          >
            None
          </PillOption>
          {values.formLevel && values.chapterName ? (
            topicOptions.map((topic) => (
              <PillOption
                key={topic.id}
                selected={values.topicId === topic.id}
                onClick={() => updateValue("topicId", topic.id)}
              >
                {topic.topic_name}
              </PillOption>
            ))
          ) : (
            <p className="px-1 py-2 text-xs text-msc-muted">
              Choose a form and chapter first to see topics.
            </p>
          )}
        </PillGroup>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={state.fieldErrors?.difficulty}>
          <LabelText>Difficulty</LabelText>
          <input type="hidden" name="difficulty" value={values.difficulty} />
          <PillGroup>
            <PillOption
              selected={values.difficulty === ""}
              onClick={() => updateValue("difficulty", "")}
            >
              None
            </PillOption>
            {[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ].map((option) => (
              <PillOption
                key={option.value}
                selected={values.difficulty === option.value}
                onClick={() => updateValue("difficulty", option.value)}
              >
                {option.label}
              </PillOption>
            ))}
          </PillGroup>
        </Field>

        <Field error={state.fieldErrors?.type}>
          <LabelText>Question type</LabelText>
          <input type="hidden" name="type" value={values.type} />
          <PillGroup>
            <PillOption
              selected={values.type === "mcq"}
              onClick={() => updateValue("type", "mcq")}
            >
              Multiple choice
            </PillOption>
            <PillOption
              selected={values.type === "short_answer"}
              onClick={() => updateValue("type", "short_answer")}
            >
              Short answer
            </PillOption>
          </PillGroup>
        </Field>
      </div>

      <Field error={state.fieldErrors?.pastPaper}>
        <LabelText>Past paper</LabelText>
        <input type="hidden" name="pastPaper" value={values.pastPaper} />
        <PillGroup>
          <PillOption
            selected={values.pastPaper === ""}
            onClick={() =>
              setValues((current) => ({
                ...current,
                pastPaper: "",
                pastPaperYear: "",
              }))
            }
          >
            None
          </PillOption>
          {[
            { value: "MSC", label: "MSC" },
            { value: "DSE", label: "DSE" },
            { value: "HKCEE", label: "HKCEE" },
            { value: "HKAE", label: "HKAE" },
            { value: "other", label: "Other" },
          ].map((option) => (
            <PillOption
              key={option.value}
              selected={values.pastPaper === option.value}
              onClick={() => updateValue("pastPaper", option.value)}
            >
              {option.label}
            </PillOption>
          ))}
        </PillGroup>
      </Field>

      {values.pastPaper ? (
        <Field error={state.fieldErrors?.pastPaperYear}>
          <LabelText>Year</LabelText>
          <input type="hidden" name="pastPaperYear" value={values.pastPaperYear} />
          <PillGroup>
            {pastPaperYearOptions.map((year) => (
              <PillOption
                key={year}
                selected={values.pastPaperYear === String(year)}
                onClick={() => updateValue("pastPaperYear", String(year))}
              >
                {year}
              </PillOption>
            ))}
          </PillGroup>
        </Field>
      ) : null}

      <Field error={state.fieldErrors?.contentText}>
        <LabelText>Question text</LabelText>
        <textarea
          name="contentText"
          rows={4}
          value={values.contentText}
          onChange={(event) => updateValue("contentText", event.target.value)}
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
          onChange={(event) =>
            setContentImageName(event.target.files?.[0]?.name ?? null)
          }
          className={fileClassName(Boolean(state.fieldErrors?.contentImageFile))}
        />
        <p className="mt-2 text-xs text-msc-muted">
          Optional. JPG, PNG, GIF, or WebP up to 5MB.
          {contentImageName ? ` Selected: ${contentImageName}` : ""}
        </p>
      </Field>

      <Field>
        <LabelText>Explanation</LabelText>
        <textarea
          name="explanationText"
          rows={3}
          value={values.explanationText}
          onChange={(event) => updateValue("explanationText", event.target.value)}
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
          onChange={(event) =>
            setExplanationImageName(event.target.files?.[0]?.name ?? null)
          }
          className={fileClassName(Boolean(state.fieldErrors?.explanationImageFile))}
        />
        {explanationImageName ? (
          <p className="mt-2 text-xs text-msc-muted">
            Selected: {explanationImageName}
          </p>
        ) : null}
      </Field>

      {values.type === "mcq" ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-msc-ink">MCQ options</h3>
          <p className="mt-1 text-sm text-msc-muted">
            Fill in all four options. Each option needs text or an image URL.
          </p>
          {state.fieldErrors?.mcqOptions ? (
            <p className="mt-2 text-sm text-red-600">{state.fieldErrors.mcqOptions}</p>
          ) : null}
          {state.fieldErrors?.mcqCorrect ? (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.mcqCorrect}</p>
          ) : null}

          <div className="mt-4 space-y-4">
            {(
              [
                ["optionText0", "optionImageUrl0", "optionCorrect0"],
                ["optionText1", "optionImageUrl1", "optionCorrect1"],
                ["optionText2", "optionImageUrl2", "optionCorrect2"],
                ["optionText3", "optionImageUrl3", "optionCorrect3"],
              ] as const
            ).map(([textKey, imageKey, correctKey], index) => {
              return (
                <div
                  key={index}
                  className="rounded-xl bg-white p-3 ring-1 ring-gray-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-msc-ink">
                      Option {String.fromCharCode(65 + index)}
                    </p>
                    <label className="flex items-center gap-2 text-sm text-msc-muted">
                      <input
                        type="checkbox"
                        name={correctKey}
                        checked={values[correctKey]}
                        onChange={(event) =>
                          updateValue(correctKey, event.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
                      />
                      Correct
                    </label>
                  </div>
                  <input
                    name={textKey}
                    value={values[textKey]}
                    onChange={(event) => updateValue(textKey, event.target.value)}
                    placeholder="Option text"
                    className={`${fieldClassName(false)} mt-3`}
                  />
                  <input
                    name={imageKey}
                    value={values[imageKey]}
                    onChange={(event) => updateValue(imageKey, event.target.value)}
                    placeholder="Option image URL (optional if text is filled)"
                    className={`${fieldClassName(false)} mt-3`}
                  />
                </div>
              );
            })}
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
              value={values.acceptedAnswers}
              onChange={(event) => updateValue("acceptedAnswers", event.target.value)}
              placeholder={"42\n42.0"}
              className={`${textareaClassName(Boolean(state.fieldErrors?.acceptedAnswers))} mt-4`}
            />
          </Field>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field error={state.fieldErrors?.answerType}>
              <LabelText>Answer rule type</LabelText>
              <input type="hidden" name="answerType" value={values.answerType} />
              <PillGroup>
                <PillOption
                  selected={values.answerType === "exact"}
                  onClick={() => updateValue("answerType", "exact")}
                >
                  Exact
                </PillOption>
                <PillOption
                  selected={values.answerType === "numeric"}
                  onClick={() => updateValue("answerType", "numeric")}
                >
                  Numeric
                </PillOption>
              </PillGroup>
            </Field>

            <Field error={state.fieldErrors?.tolerance}>
              <LabelText>Numeric tolerance</LabelText>
              <input
                name="tolerance"
                value={values.tolerance}
                onChange={(event) => updateValue("tolerance", event.target.value)}
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
          checked={values.isActive}
          onChange={(event) => updateValue("isActive", event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-msc-red focus:ring-msc-red"
        />
        Active question
      </label>

      <SubmitButton
        className="w-full"
        pendingText="Creating question"
        disabled={isPending}
      >
        Create question
      </SubmitButton>
    </form>
  );
}

function PillGroup({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex flex-wrap gap-2">{children}</div>;
}

function PillOption({
  selected,
  onClick,
  disabled = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-red/40 disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "bg-msc-red text-white shadow-sm"
          : "border border-gray-200 bg-white text-msc-ink hover:border-msc-red/30 hover:bg-msc-red/5"
      }`}
    >
      {children}
    </button>
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
