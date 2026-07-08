"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isUserRole } from "@/lib/auth/roles";

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();

  const profileId = String(formData.get("profileId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!profileId || !isUserRole(role)) {
    throw new Error("Invalid role update request.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profileId);

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/classes");
}

