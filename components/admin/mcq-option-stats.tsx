import { formatQuestionId } from "@/lib/questions/format-question-id";

export type McqStatOption = {
  id: string;
  option_text: string | null;
  is_correct: boolean;
  sort_order: number;
  selection_count: number;
};

export type McqQuestionStats = {
  id: string;
  content_text: string | null;
  content_image_url?: string | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  topic_name?: string | null;
  options: McqStatOption[];
};

export function summarizeMcqStats(options: McqStatOption[]) {
  const sorted = [...options].sort((a, b) => a.sort_order - b.sort_order);
  const total = sorted.reduce((sum, option) => sum + option.selection_count, 0);
  const correctCount = sorted
    .filter((option) => option.is_correct)
    .reduce((sum, option) => sum + option.selection_count, 0);
  const correctRate = total > 0 ? Math.round((correctCount / total) * 100) : null;

  return {
    sorted,
    total,
    correctCount,
    correctRate,
    rows: sorted.map((option, index) => {
      const percent =
        total > 0 ? Math.round((option.selection_count / total) * 100) : 0;
      return {
        ...option,
        label: String.fromCharCode(65 + index),
        percent,
      };
    }),
  };
}

export function McqOptionStatsPanel({
  question,
  compact = false,
}: {
  question: McqQuestionStats;
  compact?: boolean;
}) {
  const summary = summarizeMcqStats(question.options);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{formatQuestionId(question.id)}</Pill>
        <Pill>MCQ</Pill>
        {question.difficulty ? <Pill>{question.difficulty}</Pill> : null}
        {question.topic_name ? <Pill>{question.topic_name}</Pill> : null}
        <Pill>{`${summary.total} submissions`}</Pill>
        <Pill>
          {summary.correctRate === null
            ? "No data yet"
            : `${summary.correctRate}% correct`}
        </Pill>
      </div>

      {!compact ? (
        <p className="whitespace-pre-wrap text-sm leading-6 text-msc-ink">
          {question.content_text || "Image-only question"}
        </p>
      ) : null}

      {summary.total === 0 ? (
        <p className="text-sm text-msc-muted">
          No student selections recorded for this question yet.
        </p>
      ) : (
        <div className="space-y-3">
          {summary.rows.map((option) => (
            <div key={option.id} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-msc-ink">
                  {option.label}.{" "}
                  <span className="font-medium">
                    {option.option_text?.trim() ? option.option_text : "Image option"}
                  </span>
                  {option.is_correct ? (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Correct
                    </span>
                  ) : null}
                </p>
                <p className="text-sm font-semibold text-msc-ink">
                  {option.percent}%{" "}
                  <span className="font-medium text-msc-muted">
                    ({option.selection_count})
                  </span>
                </p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${
                    option.is_correct ? "bg-green-500" : "bg-msc-red"
                  }`}
                  style={{ width: `${option.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-ink">
      {children}
    </span>
  );
}
