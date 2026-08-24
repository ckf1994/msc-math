import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/roles";
import {
  parseViewAsRole,
  resolveEffectiveRole,
  VIEW_AS_COOKIE,
} from "@/lib/auth/view-as";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  /** Effective role used for UI and route access (may be view-as). */
  role: UserRole;
  /** Actual role stored in the database. */
  real_role: UserRole;
  avatar_url: string | null;
  is_test_account: boolean;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  is_viewing_as: boolean;
};

export const getProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, avatar_url, is_test_account, current_streak, longest_streak, total_xp",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  const realRole = data.role as UserRole;
  let viewAs: UserRole | null = null;
  if (realRole === "admin") {
    const cookieStore = await cookies();
    viewAs = parseViewAsRole(cookieStore.get(VIEW_AS_COOKIE)?.value);
  }
  const effectiveRole = resolveEffectiveRole(realRole, viewAs);

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: effectiveRole,
    real_role: realRole,
    avatar_url: data.avatar_url,
    is_test_account: data.is_test_account,
    current_streak: data.current_streak,
    longest_streak: data.longest_streak,
    total_xp: data.total_xp,
    is_viewing_as: realRole === "admin" && effectiveRole !== realRole,
  };
});
