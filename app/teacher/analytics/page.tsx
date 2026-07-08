import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherAnalyticsPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "teacher") redirect("/");

  const supabase = await createClient();
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      class:classes ( name ),
      attempts (
        score,
        max_score
      )
    `)
    .eq("assigned_by", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Teacher tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Analytics</h1>
      </div>

      {(assignments ?? []).length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-msc-muted">Assign some work to see analytics here.</p>
        </div>
      ) : (
        (assignments ?? []).map((assignment) => {
          const attempts = Array.isArray(assignment.attempts) ? assignment.attempts : [];
          const totalPercent = attempts.reduce((sum, attempt) => {
            if (!attempt.max_score) return sum;
            return sum + (attempt.score / attempt.max_score) * 100;
          }, 0);
          const averageScore = attempts.length > 0 ? Math.round(totalPercent / attempts.length) : 0;
          const klass = Array.isArray(assignment.class)
            ? assignment.class[0]
            : assignment.class;

          return (
            <article
              key={assignment.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Pill>{klass?.name || "Unknown class"}</Pill>
                <Pill>{`${attempts.length} submissions`}</Pill>
                <Pill>{`${averageScore}% avg`}</Pill>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-msc-ink">{assignment.title}</h2>
            </article>
          );
        })
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-msc-red/5 px-3 py-1 text-xs font-semibold text-msc-ink">
      {children}
    </span>
  );
}

