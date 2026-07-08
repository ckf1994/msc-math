import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { BadgeForm } from "@/components/admin/badge-form";

type BadgeRecord = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  criteria_type: "streak" | "score" | "completion" | "custom";
  criteria_value: Record<string, unknown>;
  xp_reward: number;
};

export default async function AdminBadgesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: badges } = await supabase
    .from("badges")
    .select("id, name, description, image_url, criteria_type, criteria_value, xp_reward")
    .order("created_at", { ascending: false });

  const existingBadges = (badges ?? []) as BadgeRecord[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Badges</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Create badges that reward streaks, scores, or completions. Images can be
          uploaded directly to Supabase Storage.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">Create badge</h2>
          <p className="mt-1 text-sm text-msc-muted">
            Add gamification rewards for student motivation.
          </p>
          <div className="mt-5">
            <BadgeForm />
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Existing badges</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Review the badge rules and uploaded icons.
            </p>
          </div>

          {existingBadges.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-msc-muted">No badges yet.</p>
            </div>
          ) : (
            existingBadges.map((badge) => (
              <article
                key={badge.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-msc-yellow/15">
                    {badge.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-msc-muted">No image</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-msc-ink">{badge.name}</h3>
                      <Pill>{badge.criteria_type}</Pill>
                      <Pill>{`${badge.xp_reward} XP`}</Pill>
                    </div>
                    {badge.description ? (
                      <p className="mt-2 text-sm text-msc-muted">{badge.description}</p>
                    ) : null}
                    <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-50 px-4 py-3 text-xs text-msc-muted">
                      {JSON.stringify(badge.criteria_value, null, 2)}
                    </pre>
                  </div>
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

