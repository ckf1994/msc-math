"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

function parseFormLevel(value: FormDataEntryValue | null) {
  const formLevel = Number(String(value ?? "").trim());
  return Number.isInteger(formLevel) && formLevel >= 1 && formLevel <= 6
    ? formLevel
    : null;
}

export async function createClassAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const academicYear = String(formData.get("academicYear") ?? "").trim();
  const formLevel = parseFormLevel(formData.get("formLevel"));

  if (!name || !academicYear || formLevel === null) {
    throw new Error("Please provide a class name, form level, and academic year.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("classes").insert({
    name,
    form_level: formLevel,
    academic_year: academicYear,
  });

  if (error) {
    throw new Error(`Failed to create class: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
}

export async function addClassMemberAction(formData: FormData) {
  await requireAdmin();

  const classId = String(formData.get("classId") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();
  const roleInClass = String(formData.get("roleInClass") ?? "").trim();

  if (
    !classId ||
    !userId ||
    (roleInClass !== "student" && roleInClass !== "teacher")
  ) {
    throw new Error("Invalid class membership request.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("class_members").upsert(
    {
      class_id: classId,
      user_id: userId,
      role_in_class: roleInClass,
    },
    { onConflict: "class_id,user_id" },
  );

  if (error) {
    throw new Error(`Failed to save class member: ${error.message}`);
  }

  revalidatePath("/admin/classes");
  revalidatePath("/admin/users");
}

export async function removeClassMemberAction(formData: FormData) {
  await requireAdmin();

  const membershipId = String(formData.get("membershipId") ?? "").trim();

  if (!membershipId) {
    throw new Error("Invalid member removal request.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_members")
    .delete()
    .eq("id", membershipId);

  if (error) {
    throw new Error(`Failed to remove class member: ${error.message}`);
  }

  revalidatePath("/admin/classes");
  revalidatePath("/admin/users");
}

