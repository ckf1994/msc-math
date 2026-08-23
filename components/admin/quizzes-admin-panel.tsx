"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { QuizBuilderForm, type QuizBuilderQuestion } from "@/components/admin/quiz-builder-form";
import {
  QuestionContentPreview,
  QuestionSnippet,
  type PreviewableQuestion,
} from "@/components/admin/question-content-preview";

export type ExistingQuizSet = {
  id: string;
  title: string;
  description: string | null;
  type: "quiz" | "homework" | "game";
  time_limit_seconds: number | null;
  is_published: boolean;
  questions: PreviewableQuestion[];
};

type TabId = "create" | "existing";

export function QuizzesAdminPanel({
  questions,
  existingQuizzes,
  initialTab = "create",
}: {
  questions: QuizBuilderQuestion[];
  existingQuizzes: ExistingQuizSet[];
  initialTab?: TabId;
}) {
  const [tab, setTab] = useState<TabId>(initialTab);

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Quiz admin sections"
        className="inline-flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm"
      >
        <TabButton
          id="create"
          active={tab === "create"}
          onClick={() => setTab("create")}
        >
          Create content
        </TabButton>
        <TabButton
          id="existing"
          active={tab === "existing"}
          onClick={() => setTab("existing")}
        >
          Existing sets
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold">
            {existingQuizzes.length}
          </span>
        </TabButton>
      </div>

      {tab === "create" ? (
        <section
          role="tabpanel"
          aria-labelledby="tab-create"
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-msc-ink">Create content</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Build a quiz or homework set and preview each question as you choose it.
            </p>
          </div>
          <QuizBuilderForm questions={questions} />
        </section>
      ) : (
        <section role="tabpanel" aria-labelledby="tab-existing" className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Existing sets</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Skim question snippets here, then open a set to review the full content.
            </p>
          </div>

          {existingQuizzes.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-msc-muted">No quizzes or homework sets yet.</p>
            </div>
          ) : (
            existingQuizzes.map((quiz) => (
              <ExistingQuizCard key={quiz.id} quiz={quiz} />
            ))
          )}
        </section>
      )}
    </div>
  );
}

function ExistingQuizCard({ quiz }: { quiz: ExistingQuizSet }) {
  const [expanded, setExpanded] = useState(false);
  const previewQuestions = quiz.questions.slice(0, 3);
  const remainingCount = Math.max(quiz.questions.length - previewQuestions.length, 0);

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{quiz.type}</Pill>
        <Pill>{quiz.is_published ? "Published" : "Draft"}</Pill>
        <Pill>{`${quiz.questions.length} questions`}</Pill>
        {quiz.time_limit_seconds ? <Pill>{`${quiz.time_limit_seconds}s`}</Pill> : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-msc-ink">{quiz.title}</h3>
      {quiz.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-msc-muted">{quiz.description}</p>
      ) : null}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
          Quick preview
        </p>
        {quiz.questions.length === 0 ? (
          <p className="text-sm text-msc-muted">No questions linked yet.</p>
        ) : (
          <>
            {previewQuestions.map((question, index) => (
              <QuestionSnippet key={question.id} question={question} index={index} />
            ))}
            {remainingCount > 0 && !expanded ? (
              <p className="text-xs text-msc-muted">
                +{remainingCount} more question{remainingCount === 1 ? "" : "s"}
              </p>
            ) : null}
          </>
        )}
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-msc-muted">
            Full content
          </p>
          {quiz.questions.map((question, index) => (
            <QuestionContentPreview
              key={question.id}
              question={question}
              index={index}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-msc-ink transition hover:border-msc-red/30 hover:bg-msc-red/5"
          disabled={quiz.questions.length === 0}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide full content
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Open full content
            </>
          )}
        </button>

        <Link
          href={`/admin/quizzes/${quiz.id}/preview`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-msc-red"
        >
          Preview as student
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function TabButton({
  id,
  active,
  onClick,
  children,
}: {
  id: TabId;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={`tab-${id}`}
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-msc-red text-white shadow-sm"
          : "text-msc-muted hover:bg-gray-50 hover:text-msc-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
}
