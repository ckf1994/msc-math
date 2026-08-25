import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Gamepad2,
  LogOut,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { Profile } from "@/lib/auth/get-profile";
import type { UserRole } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import LoadingQuote from "@/components/auth/loading-quote";
import { RolePreviewBar } from "@/components/shell/role-preview-bar";
import { canUseRolePreview } from "@/lib/auth/view-as";
import type { ComponentType, ReactNode } from "react";

type AppShellProps = {
  profile: Profile;
  role: UserRole;
  children: ReactNode;
};

function roleLabel(role: UserRole) {
  if (role === "student") return "Student";
  if (role === "teacher") return "Teacher";
  return "Admin";
}

export async function AppShell({ profile, role, children }: AppShellProps) {
  const showRoleBar = canUseRolePreview(profile.real_role);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-msc-red/10">
              <Sparkles className="h-5 w-5 text-msc-red" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-msc-ink">
                MSC Math
              </div>
              <div className="truncate text-xs text-msc-muted">
                {roleLabel(role)}
                {profile.is_viewing_as ? " (preview)" : ""} ·{" "}
                {profile.full_name || roleLabel(role)}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <LoadingQuote />
          </div>

          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-gray-100 md:block">
          <div className="p-4">
            <nav className="space-y-2">
              {getSidebarNav(role).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-msc-ink hover:bg-msc-red/5"
                >
                  <item.icon className="h-4 w-4 text-msc-red" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <main className="px-4 py-8 sm:px-6">
            {children}
            {role === "student" ? (
              <div className="mt-10 rounded-2xl border border-msc-yellow/30 bg-msc-yellow/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-msc-red">
                  Momentum
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <MiniStat
                    label="Streak"
                    value={profile.current_streak}
                  />
                  <MiniStat
                    label="XP"
                    value={profile.total_xp}
                  />
                  <MiniStat
                    label="Best"
                    value={profile.longest_streak}
                  />
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav — sits above admin role bar when present */}
      <nav
        className={`fixed left-0 right-0 z-30 border-t border-gray-100 bg-white md:hidden ${
          showRoleBar ? "bottom-12" : "bottom-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl justify-around px-3 py-2">
          {getMobileNav(role).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-msc-muted"
            >
              <item.icon className="h-5 w-5 text-msc-red" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {showRoleBar ? (
        <RolePreviewBar
          realRole={profile.real_role}
          activeRole={role}
          isViewingAs={profile.is_viewing_as}
        />
      ) : null}

      <div
        className={
          showRoleBar
            ? "h-28 md:h-12"
            : "h-16 md:h-0"
        }
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/70 p-3 ring-1 ring-white/60">
      <p className="text-[11px] font-semibold text-msc-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-msc-ink">{value}</p>
    </div>
  );
}

type NavIcon = ComponentType<{ className?: string }>;

type SidebarNavItem = {
  href: string;
  label: string;
  icon: NavIcon;
};

function getSidebarNav(role: UserRole): SidebarNavItem[] {
  if (role === "student") {
    return [
      { href: "/student", label: "Dashboard", icon: BookOpen },
      { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
      { href: "/student/practice", label: "Practice", icon: BookOpen },
      { href: "/student/instant-quiz", label: "Instant Quiz", icon: Zap },
      { href: "/student/games", label: "Games", icon: Gamepad2 },
      { href: "/student/results", label: "Results", icon: Trophy },
      { href: "/student/report", label: "Report", icon: Users },
      { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/student/badges", label: "Badges", icon: Trophy },
    ];
  }

  if (role === "teacher") {
    return [
      { href: "/teacher", label: "Dashboard", icon: BookOpen },
      { href: "/teacher/classes", label: "Classes", icon: Users },
      { href: "/teacher/assign", label: "Assign Work", icon: ClipboardList },
      { href: "/teacher/analytics", label: "Analytics", icon: Trophy },
    ];
  }

  return [
    { href: "/admin", label: "Dashboard", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/classes", label: "Classes", icon: Users },
    { href: "/admin/questions", label: "Questions", icon: BookOpen },
    { href: "/admin/quizzes", label: "Quizzes", icon: Zap },
    { href: "/admin/games", label: "Games", icon: Gamepad2 },
    { href: "/admin/badges", label: "Badges", icon: Trophy },
    { href: "/admin/analytics", label: "Analytics", icon: Trophy },
  ];
}

function getMobileNav(role: UserRole): SidebarNavItem[] {
  if (role === "student") {
    return [
      { href: "/student", label: "Home", icon: BookOpen },
      { href: "/student/assignments", label: "Work", icon: ClipboardList },
      { href: "/student/instant-quiz", label: "Quiz", icon: Zap },
      { href: "/student/games", label: "Games", icon: Gamepad2 },
      { href: "/student/results", label: "Results", icon: Trophy },
    ];
  }

  if (role === "teacher") {
    return [
      { href: "/teacher", label: "Home", icon: BookOpen },
      { href: "/teacher/classes", label: "Classes", icon: Users },
      { href: "/teacher/assign", label: "Assign", icon: ClipboardList },
      { href: "/teacher/analytics", label: "Analytics", icon: Trophy },
    ];
  }

  return [
    { href: "/admin", label: "Home", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/questions", label: "Questions", icon: BookOpen },
    { href: "/admin/quizzes", label: "Quizzes", icon: Zap },
    { href: "/admin/analytics", label: "Analytics", icon: Trophy },
  ];
}

