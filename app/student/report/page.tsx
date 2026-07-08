import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function StudentReportPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const supabase = await createClient();
  const { data: answers } = await supabase
    .from("attempt_answers")
    .select(`
      is_correct,
      question:questions (
        topic:topics (
          topic_name
        )
      )
    `)
    .in(
      "attempt_id",
      (
        (
          await supabase
            .from("attempts")
            .select("id")
            .eq("user_id", profile.id)
            .eq("status", "completed")
        ).data ?? []
      ).map((attempt) => attempt.id),
    );

  const stats = new Map<string, { correct: number; total: number }>();
  for (const answer of answers ?? []) {
    const question = Array.isArray(answer.question) ? answer.question[0] : answer.question;
    const topicWrapper = Array.isArray(question?.topic) ? question?.topic[0] : question?.topic;
    const topicName = topicWrapper?.topic_name ?? "Uncategorised";
    const existing = stats.get(topicName) ?? { correct: 0, total: 0 };
    existing.total += 1;
    if (answer.is_correct) existing.correct += 1;
    stats.set(topicName, existing);
  }

  const ranked = Array.from(stats.entries()).map(([topicName, value]) => ({
    topicName,
    percent: value.total > 0 ? Math.round((value.correct / value.total) * 100) : 0,
    ...value,
  }));
  const strengths = ranked.filter((entry) => entry.percent >= 80).slice(0, 3);
  const weaknesses = ranked
    .filter((entry) => entry.percent < 60)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Student area</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Strengths & Weaknesses</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopicPanel title="Strengths" items={strengths} emptyText="Complete more work to identify strengths." />
        <TopicPanel title="Needs more practice" items={weaknesses} emptyText="No weak topics detected yet." />
      </div>
    </div>
  );
}

function TopicPanel({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: { topicName: string; percent: number; total: number }[];
  emptyText: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-msc-ink">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-msc-muted">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item.topicName} className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="font-medium text-msc-ink">{item.topicName}</p>
              <p className="text-sm text-msc-muted">
                {item.percent}% correct across {item.total} question
                {item.total === 1 ? "" : "s"}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

