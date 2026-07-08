import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { GameBuilderForm } from "@/components/admin/game-builder-form";

type QuestionRecord = {
  id: string;
  type: "mcq" | "short_answer";
  difficulty: "easy" | "medium" | "hard" | null;
  content_text: string | null;
  topic:
    | {
        topic_name: string;
      }
    | {
        topic_name: string;
      }[]
    | null;
};

type GameRecord = {
  id: string;
  title: string;
  description: string | null;
  time_limit_seconds: number | null;
  is_published: boolean;
  question_links: { id: string }[] | null;
};

export default async function AdminGamesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: questions }, { data: games }] = await Promise.all([
    supabase.from("questions").select(`
      id,
      type,
      difficulty,
      content_text,
      topic:topics (
        topic_name
      )
    `).eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("quizzes").select(`
      id,
      title,
      description,
      time_limit_seconds,
      is_published,
      question_links:quiz_questions (
        id
      )
    `).eq("type", "game").order("created_at", { ascending: false }),
  ]);

  const questionOptions = ((questions ?? []) as QuestionRecord[]).map((question) => ({
    ...question,
    topic_name: Array.isArray(question.topic)
      ? (question.topic[0]?.topic_name ?? null)
      : (question.topic?.topic_name ?? null),
  }));

  const existingGames = (games ?? []) as GameRecord[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Mini Games</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Configure time-based practice games using the same question bank.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">Create game</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Games use quiz content under the hood, but are grouped separately for students.
          </p>
          <div className="mt-5">
            <GameBuilderForm questions={questionOptions} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Existing games</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Review mini-game configurations before they are surfaced to students.
            </p>
          </div>

          {existingGames.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-msc-muted">No mini games yet.</p>
            </div>
          ) : (
            existingGames.map((game) => (
              <article
                key={game.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>game</Pill>
                  <Pill>{game.is_published ? "Published" : "Draft"}</Pill>
                  <Pill>{`${game.question_links?.length ?? 0} questions`}</Pill>
                  {game.time_limit_seconds ? (
                    <Pill>{`${game.time_limit_seconds}s`}</Pill>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-msc-ink">{game.title}</h3>
                {game.description ? (
                  <p className="mt-2 text-sm text-msc-muted">{game.description}</p>
                ) : null}
                <div className="mt-4">
                  <Link
                    href={`/admin/games/${game.id}/preview`}
                    className="text-sm font-semibold text-msc-red"
                  >
                    Preview as student
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
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

