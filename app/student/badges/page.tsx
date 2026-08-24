import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import {
  StudentBadgesGrid,
  type StudentBadgeItem,
} from "@/components/student/student-badges-grid";

type BadgeRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  criteria_type: "streak" | "score" | "completion" | "custom";
  criteria_value: Record<string, unknown>;
  xp_reward: number;
  created_at: string;
};

type EarnedRow = {
  badge_id: string;
  earned_at: string;
};

export default async function StudentBadgesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const [{ data: allBadges }, { data: earnedBadges }] = await Promise.all([
    supabase
      .from("badges")
      .select(
        "id, name, description, image_url, criteria_type, criteria_value, xp_reward, created_at",
      )
      .order("created_at", { ascending: true }),
    supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", profile.id),
  ]);

  const earnedByBadgeId = new Map(
    ((earnedBadges ?? []) as EarnedRow[]).map((entry) => [
      entry.badge_id,
      entry.earned_at,
    ]),
  );

  const badges: StudentBadgeItem[] = ((allBadges ?? []) as BadgeRow[])
    .map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      image_url: badge.image_url,
      criteria_type: badge.criteria_type,
      criteria_value: badge.criteria_value,
      xp_reward: badge.xp_reward,
      earned_at: earnedByBadgeId.get(badge.id) ?? null,
    }))
    .sort((a, b) => {
      if (a.earned_at && !b.earned_at) return -1;
      if (!a.earned_at && b.earned_at) return 1;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Badges</h1>
        <p className="mt-2 max-w-2xl text-sm text-msc-muted">
          View every badge challenge. Complete the tasks below to unlock the full
          badge artwork.
        </p>
      </div>

      {badges.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">No badges available yet.</p>
        </div>
      ) : (
        <StudentBadgesGrid badges={badges} />
      )}
    </div>
  );
}
