import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";

export default async function AdminDashboardPage() {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-msc-muted">Admin dashboard</p>
        <h1 className="mt-1 text-2xl font-bold text-msc-ink">
          Welcome, {profile.full_name || "Admin"}
        </h1>
      </div>

      <div className="rounded-2xl border border-msc-yellow/30 bg-msc-yellow/10 p-6">
        <h2 className="text-xl font-bold text-msc-ink">
          App shell is connected
        </h2>
        <p className="mt-2 text-msc-muted">
          Next we’ll add the admin tools: class admin, question bank, quiz
          builder, and badges.
        </p>
      </div>
    </div>
  );
}
