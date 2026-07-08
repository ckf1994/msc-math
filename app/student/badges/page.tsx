import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentBadgesPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data: badges } = await supabase
    .from("user_badges")
    .select(`
      earned_at,
      badge:badges (
        id,
        name,
        description,
        image_url,
        xp_reward
      )
    `)
    .eq("user_id", profile.id)
    .order("earned_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Badges</h1>
      </div>

      {(badges ?? []).length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">No badges earned yet.</p>
        </div>
      ) : (
        (badges ?? []).map((entry, index) => {
          const badge = Array.isArray(entry.badge) ? entry.badge[0] : entry.badge;
          return (
            <article
              key={`${badge?.id ?? "badge"}-${index}`}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-msc-ink">{badge?.name || "Badge"}</h2>
              {badge?.description ? (
                <p className="mt-2 text-sm text-msc-muted">{badge.description}</p>
              ) : null}
              <p className="mt-2 text-sm font-semibold text-msc-red">
                {badge?.xp_reward ?? 0} XP reward
              </p>
            </article>
          );
        })
      )}
    </div>
  );
}

