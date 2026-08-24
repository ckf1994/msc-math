"use client";

import { useRef, useState } from "react";
import {
  BadgeForm,
  type EditableBadge,
} from "@/components/admin/badge-form";
import { Button } from "@/components/ui/button";

type BadgesAdminPanelProps = {
  badges: EditableBadge[];
};

export function BadgesAdminPanel({ badges }: BadgesAdminPanelProps) {
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const formSectionRef = useRef<HTMLElement | null>(null);

  const editingBadge =
    badges.find((badge) => badge.id === editingBadgeId) ?? null;

  function startEdit(badgeId: string) {
    setEditingBadgeId(badgeId);
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-msc-ink">Existing badges</h2>
          <p className="mt-1 text-sm text-msc-muted">
            {badges.length} badge{badges.length === 1 ? "" : "s"} in the collection.
            Click Edit to update a badge.
          </p>
        </div>

        {badges.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-msc-muted">No badges yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {badges.map((badge) => {
              const isSelected = editingBadgeId === badge.id;
              return (
                <article
                  key={badge.id}
                  className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${
                    isSelected
                      ? "border-msc-red/40 ring-2 ring-msc-red/15"
                      : "border-gray-100"
                  }`}
                >
                  <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl bg-msc-yellow/10">
                    {badge.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-msc-muted">
                        No image
                      </span>
                    )}
                  </div>

                  <div className="mt-4 min-w-0 flex-1 text-center">
                    <h3 className="text-base font-semibold text-msc-ink">
                      {badge.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      <Pill>{badge.criteria_type}</Pill>
                      <Pill>{`${badge.xp_reward} XP`}</Pill>
                    </div>
                    {badge.description ? (
                      <p className="mt-3 text-sm text-msc-muted">
                        {badge.description}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => startEdit(badge.id)}
                  >
                    {isSelected ? "Editing…" : "Edit"}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section
        ref={formSectionRef}
        className="max-w-xl scroll-mt-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-msc-ink">
          {editingBadge ? `Edit: ${editingBadge.name}` : "Create badge"}
        </h2>
        <p className="mt-1 text-sm text-msc-muted">
          {editingBadge
            ? "Update the badge details, criteria, or image."
            : "Add gamification rewards for student motivation."}
        </p>
        <div className="mt-5">
          <BadgeForm
            key={editingBadge?.id ?? "create"}
            badge={editingBadge}
            onCancelEdit={() => setEditingBadgeId(null)}
            onSaved={() => {
              if (editingBadge) setEditingBadgeId(null);
            }}
          />
        </div>
      </section>
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
