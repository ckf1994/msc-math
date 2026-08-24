"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { isUserRole, type UserRole } from "@/lib/auth/roles";
import { VIEW_AS_COOKIE, viewAsHome } from "@/lib/auth/view-as";

export async function setViewAsRoleAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.real_role !== "admin") {
    redirect("/");
  }

  const roleValue = String(formData.get("role") ?? "");
  if (!isUserRole(roleValue)) {
    redirect("/admin");
  }

  const role = roleValue as UserRole;
  const cookieStore = await cookies();

  if (role === "admin") {
    cookieStore.delete(VIEW_AS_COOKIE);
  } else {
    cookieStore.set(VIEW_AS_COOKIE, role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  redirect(viewAsHome(role));
}
