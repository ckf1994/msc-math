import { formatQuestionId } from "@/lib/questions/format-question-id";

export type PreviewableQuestion = {
  id: string;
  type: "mcq" | "short_answer";
  difficulty?: "easy" | "medium" | "hard" | null;
  content_text: string | null;
  content_image_url: string | null;
  explanation_text?: string | null;
  topic_name?: string | null;
  options: {
    id?: string;
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

export function QuestionSnippet({
  question,
  index,
  maxLength = 120,
}: {
  question: PreviewableQuestion;
  index?: number;
  maxLength?: number;
}) {
  const text = question.content_text?.trim() || "Image-only question";
  const truncated =
    text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;

  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {typeof index === "number" ? <Pill>{`Q${index + 1}`}</Pill> : null}
        <Pill>{formatQuestionId(question.id)}</Pill>
        <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
      </div>
      <p className="mt-2 text-sm text-msc-ink">{truncated}</p>
    </div>
  );
}

export function QuestionContentPreview({
  question,
  index,
  compact = false,
  framed = true,
  hideMeta = false,
}: {
  question: PreviewableQuestion;
  index?: number;
  compact?: boolean;
  framed?: boolean;
  hideMeta?: boolean;
}) {
  const sortedOptions = [...question.options].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const body = (
    <>
      {hideMeta ? null : (
        <div className="flex flex-wrap items-center gap-2">
          {typeof index === "number" ? <Pill>{`Question ${index + 1}`}</Pill> : null}
          <Pill>{formatQuestionId(question.id)}</Pill>
          <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
          {question.difficulty ? <Pill>{question.difficulty}</Pill> : null}
          {question.topic_name ? <Pill>{question.topic_name}</Pill> : null}
        </div>
      )}

      <div className={hideMeta ? "space-y-3" : "mt-3 space-y-3"}>
        <p
          className={`whitespace-pre-wrap text-sm leading-6 text-msc-ink ${
            compact ? "line-clamp-4" : ""
          }`}
        >
          {question.content_text || "Image-only question"}
        </p>

        {question.content_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.content_image_url}
            alt={`Preview for ${formatQuestionId(question.id)}`}
            className={`rounded-xl border border-gray-100 object-contain ${
              compact ? "max-h-40" : "max-h-64"
            }`}
          />
        ) : null}

        {!compact && question.type === "mcq" ? (
          <div className="space-y-2">
            {sortedOptions.map((option, optionIndex) => (
              <div
                key={option.id ?? `${question.id}-${option.sort_order}`}
                className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-msc-ink"
              >
                <span className="font-semibold">
                  {String.fromCharCode(65 + optionIndex)}.
                </span>{" "}
                {option.option_text || "Image option"}
                {option.is_correct ? (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Correct
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {!compact && question.type === "short_answer" ? (
          <div className="flex flex-wrap gap-2">
            {question.short_answer_rules.length === 0 ? (
              <span className="text-sm text-msc-muted">No accepted answers set.</span>
            ) : (
              question.short_answer_rules.map((rule, ruleIndex) => (
                <span
                  key={`${question.id}-rule-${ruleIndex}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-msc-ink"
                >
                  {rule.accepted_answer}
                  {rule.answer_type === "numeric" && rule.tolerance !== null
                    ? ` (±${rule.tolerance})`
                    : ""}
                </span>
              ))
            )}
          </div>
        ) : null}

        {!compact && question.explanation_text ? (
          <div className="rounded-xl bg-msc-yellow/10 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
              Explanation
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-msc-ink">
              {question.explanation_text}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );

  if (!framed) {
    return <div>{body}</div>;
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {body}
    </article>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
}
