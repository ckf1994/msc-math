import Link from "next/link";
import { redirect } from "next/navigation";
import { Gamepad2, Timer } from "lucide-react";
import { getProfile } from "@/lib/auth/get-profile";
import { CODED_GAMES } from "@/lib/games/catalog";

export default async function StudentGamesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Mini Games</h1>
        <p className="mt-2 max-w-2xl text-sm text-msc-muted">
          Practice arithmetic with timed mini games.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CODED_GAMES.map((game) => (
          <article
            key={game.slug}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-msc-yellow/20">
              <Gamepad2 className="h-6 w-6 text-msc-red" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-msc-ink">{game.title}</h2>
            <p className="mt-2 flex-1 text-sm text-msc-muted">{game.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-ink">
                <Timer className="mr-1 h-3.5 w-3.5" />
                {game.durationSeconds}s
              </span>
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-msc-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/student/games/${game.slug}`}
              className="mt-5 inline-flex rounded-xl bg-msc-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-msc-red-dark"
            >
              Play game
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
