import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getProfile } from "@/lib/auth/get-profile";
import { getRoleHome } from "@/lib/auth/roles";

export default async function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();
  if (!profile) redirect("/");
  if (profile.role !== "teacher") redirect(getRoleHome(profile.role));

  return <AppShell profile={profile} role="teacher">{children}</AppShell>;
}

