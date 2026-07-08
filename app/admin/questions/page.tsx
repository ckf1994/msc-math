import Link from "next/link";
import { BookOpen, Eye, PlusCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminQuestionsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin tools</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">Question Bank</h1>
        <p className="mt-2 max-w-3xl text-sm text-msc-muted">
          Split the workflow into a clean create flow and a separate review flow.
          Admins can add questions on one page and browse/filter the bank on another.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuestionBankCard
          href="/admin/questions/new"
          title="Add Question"
          description="Open the full question form with dynamic fields, validation, and image upload."
          icon={<PlusCircle className="h-6 w-6 text-msc-red" />}
          cta="Open Add Question"
        />
        <QuestionBankCard
          href="/admin/questions/list"
          title="View Questions"
          description="Browse the question bank with filters for form, chapter, topic, type, difficulty, and active status."
          icon={<Eye className="h-6 w-6 text-msc-red" />}
          cta="Open Question List"
        />
      </div>
    </div>
  );
}

function QuestionBankCard({
  href,
  title,
  description,
  icon,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-msc-red/20 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-msc-red/5 p-3">{icon}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-msc-muted" />
            <h2 className="text-lg font-semibold text-msc-ink">{title}</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-msc-muted">{description}</p>
          <p className="mt-4 text-sm font-semibold text-msc-red">{cta}</p>
        </div>
      </div>
    </Link>
  );
}

