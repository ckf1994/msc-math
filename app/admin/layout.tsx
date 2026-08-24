import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getProfile } from "@/lib/auth/get-profile";
import { getRoleHome } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getProfile();
  if (!profile) redirect("/");
  if (profile.role !== "admin") redirect(getRoleHome(profile.role));

  return <AppShell profile={profile} role="admin">{children}</AppShell>;
}

