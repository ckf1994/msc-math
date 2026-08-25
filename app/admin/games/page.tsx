import Link from "next/link";
import { Gamepad2, Timer } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";
import { CODED_GAMES } from "@/lib/games/catalog";

export default async function AdminGamesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Mini Games</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Games are built in code (not from the question bank). Preview them here
          before students play.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CODED_GAMES.map((game) => (
          <article
            key={game.slug}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-msc-red/5">
              <Gamepad2 className="h-6 w-6 text-msc-red" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-msc-ink">{game.title}</h2>
            <p className="mt-2 flex-1 text-sm text-msc-muted">{game.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>
                <Timer className="mr-1 inline h-3.5 w-3.5" />
                {game.durationSeconds}s
              </Pill>
              {game.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
            <Link
              href={`/admin/games/${game.slug}`}
              className="mt-5 inline-flex text-sm font-semibold text-msc-red hover:underline"
            >
              Preview game
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold capitalize text-msc-ink">
      {children}
    </span>
  );
}
