import { Clock3 } from "lucide-react";
import { formatQuestionId } from "@/lib/questions/format-question-id";

type PreviewQuestion = {
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

type PreviewQuiz = {
  title: string;
  description: string | null;
  type: "quiz" | "homework" | "game";
  time_limit_seconds: number | null;
};

export function StudentQuizPreview({
  quiz,
  questions,
}: {
  quiz: PreviewQuiz;
  questions: PreviewQuestion[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-msc-red/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Pill>{quiz.type}</Pill>
          <Pill>{`${questions.length} questions`}</Pill>
          {quiz.time_limit_seconds ? (
            <Pill>{`${quiz.time_limit_seconds}s timer`}</Pill>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-msc-ink">{quiz.title}</h1>
        {quiz.description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-msc-muted">
            {quiz.description}
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-msc-yellow/10 px-4 py-3">
          <Clock3 className="h-5 w-5 text-msc-red" />
          <p className="text-sm text-msc-ink">
            Student preview mode: layout only. Submission is disabled.
          </p>
        </div>
      </section>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <article
            key={question.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{`Question ${index + 1}`}</Pill>
              <Pill>{formatQuestionId(question.id)}</Pill>
              <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
            </div>

            <div className="mt-4">
              <p className="whitespace-pre-wrap text-base leading-7 text-msc-ink">
                {question.content_text || "Image-only question"}
              </p>
              {question.content_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={question.content_image_url}
                  alt={`Preview for ${formatQuestionId(question.id)}`}
                  className="mt-4 max-h-72 rounded-2xl border border-gray-100 object-contain"
                />
              ) : null}
            </div>

            {question.type === "mcq" ? (
              <div className="mt-5 space-y-3">
                {question.options
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((option, optionIndex) => (
                    <label
                      key={option.id}
                      className="flex items-start gap-3 rounded-2xl border border-gray-100 px-4 py-3"
                    >
                      <input
                        type="radio"
                        disabled
                        name={`preview-${question.id}`}
                        className="mt-1 h-4 w-4 text-msc-red"
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
                  disabled
                  placeholder="Student types answer here"
                  className="h-11 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-sm text-msc-muted"
                />
              </div>
            )}

            {question.explanation_text ? (
              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                  Preview note for admin
                </p>
                <p className="mt-2 text-sm text-msc-muted">
                  Explanation exists and will be available later in the student result/review flow.
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
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

