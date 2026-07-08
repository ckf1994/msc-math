import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLeaderboardPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, total_xp, current_streak")
    .eq("role", "student")
    .order("total_xp", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Leaderboard</h1>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          {(students ?? []).map((student, index) => (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
            >
              <div>
                <p className="font-medium text-msc-ink">
                  #{index + 1} {student.full_name || "Student"}
                </p>
                <p className="text-sm text-msc-muted">
                  {student.current_streak} day streak
                </p>
              </div>
              <p className="text-lg font-bold text-msc-red">{student.total_xp} XP</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

