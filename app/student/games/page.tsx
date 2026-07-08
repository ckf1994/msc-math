import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentGamesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data: games } = await supabase
    .from("quizzes")
    .select("id, title, description, time_limit_seconds")
    .eq("type", "game")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Mini Games</h1>
      </div>

      {(games ?? []).length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">No games published yet.</p>
        </div>
      ) : (
        (games ?? []).map((game) => (
          <article
            key={game.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-msc-ink">{game.title}</h2>
            {game.description ? (
              <p className="mt-2 text-sm text-msc-muted">{game.description}</p>
            ) : null}
            {game.time_limit_seconds ? (
              <p className="mt-2 text-sm text-msc-muted">{game.time_limit_seconds}s timer</p>
            ) : null}
            <Link
              href={`/student/games/${game.id}`}
              className="mt-4 inline-block text-sm font-semibold text-msc-red"
            >
              Play game
            </Link>
          </article>
        ))
      )}
    </div>
  );
}

