"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { getRoleHome, isUserRole, type UserRole } from "@/lib/auth/roles";
import {
  allowedViewAsRoles,
  VIEW_AS_COOKIE,
  viewAsHome,
} from "@/lib/auth/view-as";

export async function setViewAsRoleAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile) redirect("/");

  const allowedRoles = allowedViewAsRoles(profile.real_role);
  if (allowedRoles.length === 0) redirect("/");

  const roleValue = String(formData.get("role") ?? "");
  if (!isUserRole(roleValue) || !allowedRoles.includes(roleValue)) {
    redirect(getRoleHome(profile.real_role));
  }

  const role = roleValue as UserRole;
  const cookieStore = await cookies();

  if (role === profile.real_role) {
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
