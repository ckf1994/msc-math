import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherDashboardPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "teacher") {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: classMemberships }, { data: assignments }, { count: attemptsCount }] =
    await Promise.all([
      supabase
        .from("class_members")
        .select("class_id")
        .eq("user_id", profile.id)
        .eq("role_in_class", "teacher"),
      supabase
        .from("assignments")
        .select("id, title")
        .eq("assigned_by", profile.id),
      supabase
        .from("attempts")
        .select("*", { count: "exact", head: true })
        .not("assignment_id", "is", null),
    ]);

  const classCount = classMemberships?.length ?? 0;
  const assignmentCount = assignments?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Teacher dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">
          Welcome, {profile.full_name || "Teacher"}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="My classes" value={classCount} />
        <StatCard label="Assignments created" value={assignmentCount} />
        <StatCard label="Student submissions" value={attemptsCount ?? 0} />
      </div>

      <div className="rounded-2xl border border-msc-red/15 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-msc-ink">Teacher workspace ready</h2>
        <p className="mt-2 text-msc-muted">
          Use `Classes`, `Assign Work`, and `Analytics` to manage `1A`, publish work,
          and monitor student performance.
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
