import Link from "next/link";
import { ChevronLeft, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatQuestionId } from "@/lib/questions/format-question-id";

type TopicRecord = {
  id: string;
  form_level: number;
  chapter_name: string;
  topic_name: string;
  sort_order: number;
};

type QuestionRow = {
  id: string;
  difficulty: "easy" | "medium" | "hard" | null;
  type: "mcq" | "short_answer";
  content_text: string | null;
  content_image_url: string | null;
  explanation_text: string | null;
  is_active: boolean;
  created_at: string;
  metadata: {
    formLevel?: number | null;
    chapterName?: string | null;
  } | null;
  topic:
    | {
        id: string;
        form_level: number;
        chapter_name: string;
        topic_name: string;
      }
    | {
        id: string;
        form_level: number;
        chapter_name: string;
        topic_name: string;
      }[]
    | null;
  options:
    | {
        option_text: string | null;
        is_correct: boolean;
        sort_order: number;
      }[]
    | null;
  short_answer_rules:
    | {
        accepted_answer: string;
        answer_type: "exact" | "numeric";
        tolerance: number | null;
      }[]
    | null;
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    formLevel?: string;
    chapterName?: string;
    topicId?: string;
    type?: string;
    difficulty?: string;
    active?: string;
  }>;
};

export default async function AdminQuestionsListPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: topics }, { data: questions }] = await Promise.all([
    supabase
      .from("topics")
      .select("id, form_level, chapter_name, topic_name, sort_order")
      .order("form_level", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("chapter_name", { ascending: true })
      .order("topic_name", { ascending: true }),
    supabase
      .from("questions")
      .select(`
        id,
        difficulty,
        type,
        content_text,
        content_image_url,
        explanation_text,
        is_active,
        created_at,
        metadata,
        topic:topics (
          id,
          form_level,
          chapter_name,
          topic_name
        ),
        options:question_options (
          option_text,
          is_correct,
          sort_order
        ),
        short_answer_rules (
          accepted_answer,
          answer_type,
          tolerance
        )
      `)
      .order("created_at", { ascending: false }),
  ]);

  const allTopics = (topics ?? []) as TopicRecord[];
  const allQuestions = ((questions ?? []) as QuestionRow[]).map((question) => ({
    ...question,
    topic: Array.isArray(question.topic) ? (question.topic[0] ?? null) : question.topic,
    options: question.options ?? [],
    short_answer_rules: question.short_answer_rules ?? [],
  }));

  const chapters = Array.from(
    new Set(
      allTopics
        .filter((topic) =>
          params.formLevel ? String(topic.form_level) === params.formLevel : true,
        )
        .map((topic) => topic.chapter_name),
    ),
  ).sort();

  const filteredTopics = allTopics.filter((topic) => {
    const matchesForm = params.formLevel
      ? String(topic.form_level) === params.formLevel
      : true;
    const matchesChapter = params.chapterName
      ? topic.chapter_name === params.chapterName
      : true;
    return matchesForm && matchesChapter;
  });

  const filteredQuestions = allQuestions.filter((question) => {
    const textBlob = [
      question.content_text,
      question.explanation_text,
      question.topic?.topic_name,
      question.topic?.chapter_name,
      question.metadata?.chapterName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery = params.q
      ? textBlob.includes(params.q.trim().toLowerCase())
      : true;
    const matchesForm = params.formLevel
      ? String(question.topic?.form_level ?? question.metadata?.formLevel ?? "") ===
        params.formLevel
      : true;
    const matchesChapter = params.chapterName
      ? (question.topic?.chapter_name ?? question.metadata?.chapterName ?? "") ===
        params.chapterName
      : true;
    const matchesTopic = params.topicId ? question.topic?.id === params.topicId : true;
    const matchesType = params.type ? question.type === params.type : true;
    const matchesDifficulty = params.difficulty
      ? question.difficulty === params.difficulty
      : true;
    const matchesActive =
      params.active === "active"
        ? question.is_active
        : params.active === "inactive"
          ? !question.is_active
          : true;

    return (
      matchesQuery &&
      matchesForm &&
      matchesChapter &&
      matchesTopic &&
      matchesType &&
      matchesDifficulty &&
      matchesActive
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-2 text-sm font-medium text-msc-muted hover:text-msc-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to question bank
        </Link>
        <p className="mt-4 text-sm text-msc-muted">Question bank</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">View Questions</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Filter by form, chapter, topic, type, difficulty, and status to find
          questions quickly.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-msc-red" />
          <h2 className="text-lg font-semibold text-msc-ink">Filters</h2>
        </div>
        <form className="grid gap-4 lg:grid-cols-4">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search question text"
            className={fieldClassName()}
          />
          <select
            name="formLevel"
            defaultValue={params.formLevel ?? ""}
            className={fieldClassName()}
          >
            <option value="">All forms</option>
            {Array.from(new Set(allTopics.map((topic) => topic.form_level)))
              .sort()
              .map((formLevel) => (
                <option key={formLevel} value={String(formLevel)}>
                  {`F.${formLevel}`}
                </option>
              ))}
          </select>
          <select
            name="chapterName"
            defaultValue={params.chapterName ?? ""}
            className={fieldClassName()}
          >
            <option value="">All chapters</option>
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
          <select
            name="topicId"
            defaultValue={params.topicId ?? ""}
            className={fieldClassName()}
          >
            <option value="">All topics</option>
            {filteredTopics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.topic_name}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={params.type ?? ""}
            className={fieldClassName()}
          >
            <option value="">All types</option>
            <option value="mcq">MCQ</option>
            <option value="short_answer">Short answer</option>
          </select>
          <select
            name="difficulty"
            defaultValue={params.difficulty ?? ""}
            className={fieldClassName()}
          >
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            name="active"
            defaultValue={params.active ?? ""}
            className={fieldClassName()}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex gap-3">
            <button
              type="submit"
              className="h-11 rounded-xl bg-msc-red px-5 text-sm font-semibold text-white"
            >
              Apply
            </button>
            <Link
              href="/admin/questions/list"
              className="inline-flex h-11 items-center justify-center rounded-xl border-2 border-gray-200 px-5 text-sm font-semibold text-msc-ink"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-msc-muted">
            {filteredQuestions.length} question
            {filteredQuestions.length === 1 ? "" : "s"} found
          </p>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-msc-muted">
              No questions match the current filters.
            </p>
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <article
              key={question.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{formatQuestionId(question.id)}</Pill>
                <Pill>{question.type === "mcq" ? "MCQ" : "Short answer"}</Pill>
                {question.difficulty ? <Pill>{question.difficulty}</Pill> : null}
                <Pill>{question.is_active ? "Active" : "Inactive"}</Pill>
                {question.topic ? (
                  <>
                    <Pill>{`F.${question.topic.form_level}`}</Pill>
                    <Pill>{question.topic.chapter_name}</Pill>
                    <Pill>{question.topic.topic_name}</Pill>
                  </>
                ) : question.metadata?.formLevel || question.metadata?.chapterName ? (
                  <>
                    {question.metadata?.formLevel ? (
                      <Pill>{`F.${question.metadata.formLevel}`}</Pill>
                    ) : null}
                    {question.metadata?.chapterName ? (
                      <Pill>{question.metadata.chapterName}</Pill>
                    ) : null}
                    <Pill>No topic chosen</Pill>
                  </>
                ) : (
                  <Pill>Uncategorised</Pill>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                    Question
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-msc-ink">
                    {question.content_text || "Image-only question"}
                  </p>
                  {question.content_image_url ? (
                    <a
                      href={question.content_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-msc-red"
                    >
                      Open question image
                    </a>
                  ) : null}
                </div>

                {question.type === "mcq" ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                      Options
                    </p>
                    <div className="mt-2 space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={`${question.id}-${option.sort_order}`}
                          className="rounded-xl bg-gray-50 px-4 py-3 text-sm"
                        >
                          <span className="font-semibold text-msc-ink">
                            {String.fromCharCode(65 + option.sort_order)}.
                          </span>{" "}
                          <span className="text-msc-ink">
                            {option.option_text || "Image option"}
                          </span>
                          {option.is_correct ? (
                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              Correct
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                      Accepted answers
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {question.short_answer_rules.map((rule, index) => (
                        <span
                          key={`${question.id}-rule-${index}`}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-msc-ink"
                        >
                          {rule.accepted_answer}
                          {rule.answer_type === "numeric" && rule.tolerance !== null
                            ? ` (±${rule.tolerance})`
                            : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {question.explanation_text ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
                      Explanation
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-msc-muted">
                      {question.explanation_text}
                    </p>
                  </div>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function fieldClassName() {
  return "h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-msc-ink outline-none focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10";
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
}

