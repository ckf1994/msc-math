import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

type ClassRow = {
  id: string;
  name: string;
};

type MembershipRow = {
  user_id: string;
  class:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
};

type StudentRow = {
  id: string;
  email: string;
  full_name: string | null;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  is_test_account: boolean;
};

type AttemptRow = {
  id: string;
  user_id: string;
  score: number | null;
  max_score: number | null;
  xp_earned: number;
  time_spent_seconds: number | null;
  completed_at: string | null;
  status: string;
};

function avg(numbers: number[]) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function percent(score: number | null, maxScore: number | null) {
  if (score == null || !maxScore) return null;
  return (score / maxScore) * 100;
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: classes }, { data: students }, { data: memberships }, { data: attempts }] =
    await Promise.all([
      supabase
        .from("classes")
        .select("id, name")
        .in("name", ["1A", "1B"])
        .order("name", { ascending: true }),
      supabase
        .from("profiles")
        .select(
          "id, email, full_name, total_xp, current_streak, longest_streak, is_test_account",
        )
        .eq("role", "student")
        .eq("is_test_account", true)
        .like("email", "student%@test.msc.edu.hk")
        .order("full_name", { ascending: true }),
      supabase
        .from("class_members")
        .select(`
          user_id,
          class:classes (
            id,
            name
          )
        `)
        .eq("role_in_class", "student"),
      supabase
        .from("attempts")
        .select(
          "id, user_id, score, max_score, xp_earned, time_spent_seconds, completed_at, status",
        )
        .eq("status", "completed")
        .order("completed_at", { ascending: false }),
    ]);

  const classList = (classes ?? []) as ClassRow[];
  const demoStudents = (students ?? []) as StudentRow[];
  const studentIds = new Set(demoStudents.map((student) => student.id));

  const classNameByUser = new Map<string, string>();
  ((memberships ?? []) as MembershipRow[]).forEach((membership) => {
    if (!studentIds.has(membership.user_id)) return;
    const klass = Array.isArray(membership.class)
      ? membership.class[0]
      : membership.class;
    if (klass?.name) classNameByUser.set(membership.user_id, klass.name);
  });

  const demoAttempts = ((attempts ?? []) as AttemptRow[]).filter((attempt) =>
    studentIds.has(attempt.user_id),
  );

  const attemptsByUser = new Map<string, AttemptRow[]>();
  demoAttempts.forEach((attempt) => {
    const list = attemptsByUser.get(attempt.user_id) ?? [];
    list.push(attempt);
    attemptsByUser.set(attempt.user_id, list);
  });

  const studentCards = demoStudents.map((student) => {
    const studentAttempts = attemptsByUser.get(student.id) ?? [];
    const percents = studentAttempts
      .map((attempt) => percent(attempt.score, attempt.max_score))
      .filter((value): value is number => value !== null);
    return {
      ...student,
      className: classNameByUser.get(student.id) ?? "Unassigned",
      attemptCount: studentAttempts.length,
      averagePercent: Math.round(avg(percents)),
    };
  });

  const byClass = ["1A", "1B"].map((className) => {
    const members = studentCards.filter((student) => student.className === className);
    const memberIds = new Set(members.map((student) => student.id));
    const classAttempts = demoAttempts.filter((attempt) => memberIds.has(attempt.user_id));
    const percents = classAttempts
      .map((attempt) => percent(attempt.score, attempt.max_score))
      .filter((value): value is number => value !== null);

    return {
      className,
      studentCount: members.length,
      submissionCount: classAttempts.length,
      averageXp: Math.round(avg(members.map((student) => student.total_xp))),
      averageStreak: Math.round(avg(members.map((student) => student.current_streak))),
      averagePercent: Math.round(avg(percents)),
    };
  });

  const allPercents = demoAttempts
    .map((attempt) => percent(attempt.score, attempt.max_score))
    .filter((value): value is number => value !== null);

  const buckets = [
    { label: "0–39%", min: 0, max: 39, count: 0 },
    { label: "40–59%", min: 40, max: 59, count: 0 },
    { label: "60–79%", min: 60, max: 79, count: 0 },
    { label: "80–100%", min: 80, max: 100, count: 0 },
  ];
  allPercents.forEach((value) => {
    const rounded = Math.round(value);
    const bucket = buckets.find((item) => rounded >= item.min && rounded <= item.max);
    if (bucket) bucket.count += 1;
  });
  const maxBucket = Math.max(...buckets.map((bucket) => bucket.count), 1);

  const overall = {
    students: demoStudents.length,
    submissions: demoAttempts.length,
    averageXp: Math.round(avg(demoStudents.map((student) => student.total_xp))),
    averagePercent: Math.round(avg(allPercents)),
  };

  const recentAttempts = demoAttempts.slice(0, 8).map((attempt) => {
    const student = demoStudents.find((item) => item.id === attempt.user_id);
    return {
      id: attempt.id,
      studentName: student?.full_name || student?.email || "Student",
      className: classNameByUser.get(attempt.user_id) ?? "—",
      percent: Math.round(percent(attempt.score, attempt.max_score) ?? 0),
      xp: attempt.xp_earned,
      completedAt: attempt.completed_at,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Demo cohort overview for 10 test students — 4 in 1A and 6 in 1B — including
          XP, streaks, and quiz performance.
        </p>
      </div>

      {demoStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-msc-ink">No demo students yet</h2>
          <p className="mt-2 text-sm text-msc-muted">
            Add <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            to <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">.env.local</code>, then run:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-50 p-4 text-xs text-msc-ink">
            node scripts/seed-demo-students.mjs
          </pre>
          <p className="mt-3 text-sm text-msc-muted">
            Password for all seeded accounts:{" "}
            <span className="font-semibold text-msc-ink">DemoStudent123!</span>
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Demo students" value={overall.students} />
            <StatCard label="Submissions" value={overall.submissions} />
            <StatCard label="Avg XP" value={overall.averageXp} />
            <StatCard label="Avg score" value={`${overall.averagePercent}%`} />
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            {byClass.map((klass) => (
              <article
                key={klass.className}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{klass.className}</Pill>
                  <Pill>{`${klass.studentCount} students`}</Pill>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-msc-ink">
                  Class {klass.className}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniStat label="Submissions" value={String(klass.submissionCount)} />
                  <MiniStat label="Avg score" value={`${klass.averagePercent}%`} />
                  <MiniStat label="Avg XP" value={String(klass.averageXp)} />
                  <MiniStat label="Avg streak" value={String(klass.averageStreak)} />
                </div>
              </article>
            ))}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Score distribution</h2>
            <p className="mt-1 text-sm text-msc-muted">
              Completed demo quiz attempts across both classes.
            </p>
            <div className="mt-5 space-y-3">
              {buckets.map((bucket) => (
                <div key={bucket.label} className="grid grid-cols-[88px_1fr_40px] items-center gap-3">
                  <p className="text-sm font-medium text-msc-ink">{bucket.label}</p>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-msc-red"
                      style={{ width: `${(bucket.count / maxBucket) * 100}%` }}
                    />
                  </div>
                  <p className="text-right text-sm font-semibold text-msc-ink">
                    {bucket.count}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Demo students</h2>
            <p className="mt-1 text-sm text-msc-muted">
              {classList.map((klass) => klass.name).join(" · ") || "1A · 1B"} cohort
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-msc-muted">
                    <th className="px-2 py-2 font-medium">Student</th>
                    <th className="px-2 py-2 font-medium">Class</th>
                    <th className="px-2 py-2 font-medium">XP</th>
                    <th className="px-2 py-2 font-medium">Streak</th>
                    <th className="px-2 py-2 font-medium">Attempts</th>
                    <th className="px-2 py-2 font-medium">Avg %</th>
                  </tr>
                </thead>
                <tbody>
                  {studentCards.map((student) => (
                    <tr key={student.id} className="border-b border-gray-50">
                      <td className="px-2 py-3">
                        <p className="font-semibold text-msc-ink">
                          {student.full_name || "Unnamed"}
                        </p>
                        <p className="text-xs text-msc-muted">{student.email}</p>
                      </td>
                      <td className="px-2 py-3">
                        <Pill>{student.className}</Pill>
                      </td>
                      <td className="px-2 py-3 font-semibold text-msc-ink">
                        {student.total_xp}
                      </td>
                      <td className="px-2 py-3 text-msc-ink">
                        {student.current_streak}
                        <span className="text-msc-muted">
                          {" "}
                          / best {student.longest_streak}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-msc-ink">{student.attemptCount}</td>
                      <td className="px-2 py-3 font-semibold text-msc-ink">
                        {student.attemptCount > 0 ? `${student.averagePercent}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-msc-ink">Recent submissions</h2>
            <div className="mt-4 space-y-3">
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-msc-muted">No completed attempts yet.</p>
              ) : (
                recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-msc-ink">{attempt.studentName}</p>
                      <p className="text-xs text-msc-muted">
                        {attempt.className}
                        {attempt.completedAt
                          ? ` · ${new Date(attempt.completedAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill>{`${attempt.percent}%`}</Pill>
                      <Pill>{`+${attempt.xp} XP`}</Pill>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-msc-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-msc-ink">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-3">
      <p className="text-xs font-medium text-msc-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-msc-ink">{value}</p>
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
