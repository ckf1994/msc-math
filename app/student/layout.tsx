import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getProfile } from "@/lib/auth/get-profile";

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  return <AppShell profile={profile} role="student">{children}</AppShell>;
}

