import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { BadgesAdminPanel } from "@/components/admin/badges-admin-panel";
import type { EditableBadge } from "@/components/admin/badge-form";

export default async function AdminBadgesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: badges } = await supabase
    .from("badges")
    .select("id, name, description, image_url, criteria_type, criteria_value, xp_reward")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Badges</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Create and edit badges that reward streaks, scores, or completions.
          Images can be uploaded directly to Supabase Storage.
        </p>
      </div>

      <BadgesAdminPanel badges={(badges ?? []) as EditableBadge[]} />
    </div>
  );
}
