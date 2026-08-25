import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { SpeedMathGame } from "@/components/games/speed-math-game";

export default async function StudentSpeedMathPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-msc-muted">Mini games</p>
          <h1 className="mt-1 text-2xl font-bold text-msc-ink">Speed Math</h1>
        </div>
        <Link
          href="/student/games"
          className="text-sm font-semibold text-msc-red hover:underline"
        >
          Back to games
        </Link>
      </div>

      <SpeedMathGame />
    </div>
  );
}
