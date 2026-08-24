import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getProfile } from "@/lib/auth/get-profile";
import { getRoleHome } from "@/lib/auth/roles";

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();
  if (!profile) redirect("/");
  if (profile.role !== "student") redirect(getRoleHome(profile.role));

  return <AppShell profile={profile} role="student">{children}</AppShell>;
}

