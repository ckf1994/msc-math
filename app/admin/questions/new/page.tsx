import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { QuestionForm } from "@/components/question-bank/question-form";

type TopicRecord = {
  id: string;
  form_level: number;
  chapter_name: string;
  topic_name: string;
  sort_order: number;
};

export default async function AdminQuestionsNewPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: topics } = await supabase
    .from("topics")
    .select("id, form_level, chapter_name, topic_name, sort_order")
    .order("form_level", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("chapter_name", { ascending: true })
    .order("topic_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-2 text-sm font-medium text-msc-muted hover:text-msc-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to question bank
        </Link>
        <p className="mt-4 text-sm text-msc-muted">Question bank</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Add Question</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Add the core question first, then optionally classify it by form, chapter,
          topic, and difficulty. Those metadata fields are optional for now.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <QuestionForm topics={(topics ?? []) as TopicRecord[]} />
      </section>
    </div>
  );
}

