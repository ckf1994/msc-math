import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";

export async function requireAdmin() {
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}

