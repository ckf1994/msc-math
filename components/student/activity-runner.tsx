"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeActivityAction } from "@/app/student/actions";
import { Button } from "@/components/ui/button";
import { formatQuestionId } from "@/lib/questions/format-question-id";

type ActivityQuestion = {
  id: string;
  type: "mcq" | "short_answer";
  content_text: string | null;
  content_image_url: string | null;
  explanation_text: string | null;
  options: {
    id: string;
    option_text: string | null;
    is_correct: boolean;
    sort_order: number;
  }[];
  short_answer_rules: {
    accepted_answer: string;
    answer_type: "exact" | "numeric";
    tolerance: number | null;
  }[];
};

type ActivityRunnerProps = {
  quizId: string;
  assignmentId?: string | null;
  title: string;
  description?: string | null;
  questions: ActivityQuestion[];
};

export function ActivityRunner({
  quizId,
  assignmentId,
  title,
  description,
  questions,
}: ActivityRunnerProps) {
  const router = useRouter();
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<
    Record<string, { selectedOptionId?: string | null; textAnswer?: string | null }>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const gradedPreview = useMemo(() => {
    return questions.map((question) => {
      const answer = answers[question.id];
      let isCorrect: boolean | null = null;
      if (!answer) return { questionId: question.id, isCorrect };

      if (question.type === "mcq" && answer.selectedOptionId) {
        const option = question.options.find((candidate) => candidate.id === answer.selectedOptionId);
        isCorrect = option?.is_correct ?? false;
      } else if (question.type === "short_answer" && answer.textAnswer) {
        const submitted = answer.textAnswer.trim();
        isCorrect = question.short_answer_rules.some((rule) => {
          if (rule.answer_type === "numeric") {
            const submittedNumber = Number(submitted);
            const expectedNumber = Number(rule.accepted_answer);
            if (!Number.isFinite(submittedNumber) || !Number.isFinite(expectedNumber)) {
              return false;
            }
            const tolerance = rule.tolerance ?? 0;
            return Math.abs(submittedNumber - expectedNumber) <= tolerance;
          }
          return submitted.toLowerCase() === rule.accepted_answer.trim().toLowerCase();
        });
      }

      return { questionId: question.id, isCorrect };
    });
  }, [answers, questions]);

  function setMcqAnswer(questionId: string, optionId: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: { selectedOptionId: optionId },
    }));
  }

  function setShortAnswer(questionId: string, textAnswer: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: { textAnswer },
    }));
  }

  function handleSubmit() {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await completeActivityAction({
          quizId,
          assignmentId,
          startedAt,
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedOptionId: answers[question.id]?.selectedOptionId ?? null,
            textAnswer: answers[question.id]?.textAnswer ?? null,
          })),
        });
        router.push(`/student/results/${result.attemptId}`);
        router.refresh();
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to submit activity.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-msc-yellow/30 bg-msc-yellow/10 p-6">
        <h1 className="text-2xl font-bold text-msc-ink">{title}</h1>
        {description ? <p className="mt-2 text-sm text-msc-muted">{description}</p> : null}
        <p className="mt-3 text-sm text-msc-ink">
          Instant feedback appears while you answer. Submit when you are ready.
        </p>
      </section>

      {questions.map((question, index) => {
        const preview = gradedPreview.find((item) => item.questionId === question.id);
        return (
          <article
            key={question.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              <Pill>{`Question ${index + 1}`}</Pill>
              <Pill>{formatQuestionId(question.id)}</Pill>
              <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-msc-ink">
              {question.content_text || "Image-only question"}
            </p>
            {question.content_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={question.content_image_url}
                alt={formatQuestionId(question.id)}
                className="mt-4 max-h-72 rounded-2xl border border-gray-100 object-contain"
              />
            ) : null}

            {question.type === "mcq" ? (
              <div className="mt-5 space-y-3">
                {question.options
                  .slice()
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((option, optionIndex) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 px-4 py-3"
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[question.id]?.selectedOptionId === option.id}
                        onChange={() => setMcqAnswer(question.id, option.id)}
                        className="mt-1 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-semibold text-msc-ink">
                          {String.fromCharCode(65 + optionIndex)}.
                        </p>
                        <p className="text-sm text-msc-ink">
                          {option.option_text || "Image option"}
                        </p>
                      </div>
                    </label>
                  ))}
              </div>
            ) : (
              <div className="mt-5">
                <input
                  value={answers[question.id]?.textAnswer ?? ""}
                  onChange={(event) => setShortAnswer(question.id, event.target.value)}
                  placeholder="Type your answer"
                  className="h-11 w-full rounded-xl border-2 border-gray-200 px-4 text-sm text-msc-ink"
                />
              </div>
            )}

            {preview && preview.isCorrect !== null ? (
              <p
                className={`mt-4 text-sm font-semibold ${
                  preview.isCorrect ? "text-green-700" : "text-red-600"
                }`}
              >
                {preview.isCorrect ? "Correct" : "Not correct yet"}
              </p>
            ) : null}
          </article>
        );
      })}

      {submitError ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <Button onClick={handleSubmit} disabled={isPending} className="w-full" size="lg">
        {isPending ? "Submitting..." : "Finish and save result"}
      </Button>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
}

