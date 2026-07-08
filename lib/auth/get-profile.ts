import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/roles";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_test_account: boolean;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, avatar_url, is_test_account, current_streak, longest_streak, total_xp",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}
