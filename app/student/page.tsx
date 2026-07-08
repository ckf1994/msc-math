import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentDashboardPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "student") {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: assignments }, { count: attemptsCount }, { count: earnedBadgesCount }] =
    await Promise.all([
      supabase
        .from("class_members")
        .select(`
          class:classes (
            assignments (
              id,
              title,
              due_at
            )
          )
        `)
        .eq("user_id", profile.id)
        .eq("role_in_class", "student"),
      supabase
        .from("attempts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id),
      supabase
        .from("user_badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id),
    ]);

  const pendingAssignments = (assignments ?? [])
    .flatMap((row) => {
      const klass = Array.isArray(row.class) ? row.class[0] : row.class;
      return Array.isArray(klass?.assignments) ? klass.assignments : [];
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">
          Hello, {profile.full_name || "Student"}!
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending work" value={pendingAssignments.length} />
        <StatCard label="Attempts completed" value={attemptsCount ?? 0} />
        <StatCard label="Badges earned" value={earnedBadgesCount ?? 0} />
      </div>

      <div className="rounded-2xl border border-msc-yellow/30 bg-msc-yellow/10 p-6">
        <p className="text-sm font-medium text-msc-red">Today’s focus</p>
        <h2 className="mt-1 text-xl font-bold text-msc-ink">
          {pendingAssignments.length > 0
            ? pendingAssignments[0]?.title
            : "No pending assignment right now"}
        </h2>
        <p className="mt-2 text-msc-muted">
          Jump into assignments, self-practice, instant quizzes, or mini games from the sidebar.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-msc-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-msc-ink">{value}</p>
    </div>
  );
}
