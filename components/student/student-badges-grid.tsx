import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { formatBadgeRequirement } from "@/lib/badges/format-requirement";

export type StudentBadgeItem = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  criteria_type: "streak" | "score" | "completion" | "custom";
  criteria_value: Record<string, unknown>;
  xp_reward: number;
  earned_at: string | null;
};

type StudentBadgesGridProps = {
  badges: StudentBadgeItem[];
};

export function StudentBadgesGrid({ badges }: StudentBadgesGridProps) {
  const earnedCount = badges.filter((badge) => badge.earned_at).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-msc-yellow/30 bg-msc-yellow/10 p-4">
        <p className="text-sm font-semibold text-msc-ink">
          {earnedCount} / {badges.length} badges earned
        </p>
        <p className="mt-1 text-sm text-msc-muted">
          Complete challenges to unlock full-colour badges.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge) => (
          <StudentBadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}

function StudentBadgeCard({ badge }: { badge: StudentBadgeItem }) {
  const earned = Boolean(badge.earned_at);
  const requirement = formatBadgeRequirement(
    badge.criteria_type,
    badge.criteria_value,
  );

  return (
    <article
      className={`flex flex-col rounded-2xl border p-5 shadow-sm ${
        earned
          ? "border-msc-red/15 bg-white ring-1 ring-msc-red/10"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl bg-white">
        {badge.image_url ? (
          earned ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badge.image_url}
              alt={badge.name}
              className="h-full w-full object-contain p-3"
            />
          ) : (
            <LockedBadgeSilhouette imageUrl={badge.image_url} name={badge.name} />
          )
        ) : (
          <span className="text-sm font-semibold text-msc-muted">No image</span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col text-center">
        <h2 className="text-base font-semibold text-msc-ink">{badge.name}</h2>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {earned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <Sparkles className="h-3.5 w-3.5" />
              Earned
            </span>
          ) : (
            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              Locked
            </span>
          )}
          <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-red">
            {badge.xp_reward} XP
          </span>
        </div>

        {badge.description ? (
          <p className="mt-3 text-sm text-msc-muted">{badge.description}</p>
        ) : null}

        <div
          className={`mt-4 rounded-xl px-3 py-3 text-left ${
            earned ? "bg-msc-yellow/10" : "bg-white ring-1 ring-gray-200"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-msc-muted">
            Challenge
          </p>
          <p className="mt-1 text-sm font-medium text-msc-ink">{requirement}</p>
        </div>

        {earned && badge.earned_at ? (
          <p className="mt-3 text-xs text-msc-muted">
            Earned {new Date(badge.earned_at).toLocaleDateString("en-HK")}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function LockedBadgeSilhouette({
  imageUrl,
  name,
}: {
  imageUrl: string;
  name: string;
}) {
  const maskStyle: CSSProperties = {
    maskImage: `url("${imageUrl}")`,
    WebkitMaskImage: `url("${imageUrl}")`,
    maskMode: "alpha",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-3">
      <div
        className="h-full w-full bg-gray-400"
        style={maskStyle}
        role="img"
        aria-label={`${name} (locked)`}
      />
    </div>
  );
}
