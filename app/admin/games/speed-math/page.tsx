import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SpeedMathGame } from "@/components/games/speed-math-game";

export default async function AdminSpeedMathPreviewPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-msc-muted">Coded games</p>
          <h1 className="mt-1 text-2xl font-bold text-msc-ink">Speed Math</h1>
          <p className="mt-2 text-sm text-msc-muted">
            Admin preview — play the coded game exactly as students see it.
          </p>
        </div>
        <Link
          href="/admin/games"
          className="text-sm font-semibold text-msc-red hover:underline"
        >
          Back to games
        </Link>
      </div>

      <SpeedMathGame />
    </div>
  );
}
