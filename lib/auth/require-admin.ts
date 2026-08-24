import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";

export async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || profile.real_role !== "admin") {
    redirect("/");
  }

  return profile;
}
