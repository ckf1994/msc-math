"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";

function normalize(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createAssignmentAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.role !== "teacher") {
    throw new Error("Only teachers can create assignments.");
  }

  const classId = normalize(formData.get("classId"));
  const quizId = normalize(formData.get("quizId"));
  const title = normalize(formData.get("title"));
  const instructions = normalize(formData.get("instructions"));
  const dueAt = normalize(formData.get("dueAt"));
  const allowComments = formData.get("allowComments") === "on";

  if (!classId || !quizId || !title) {
    throw new Error("Class, quiz, and title are required.");
  }

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("class_members")
    .select("id")
    .eq("class_id", classId)
    .eq("user_id", profile.id)
    .eq("role_in_class", "teacher")
    .maybeSingle();

  if (!membership) {
    throw new Error("You can only assign work to your own classes.");
  }

  const { error } = await supabase.from("assignments").insert({
    class_id: classId,
    quiz_id: quizId,
    assigned_by: profile.id,
    title,
    instructions,
    due_at: dueAt,
    allow_comments: allowComments,
  });

  if (error) {
    throw new Error(`Failed to create assignment: ${error.message}`);
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/assign");
  revalidatePath("/teacher/classes");
  revalidatePath("/teacher/analytics");
  revalidatePath("/student");
  revalidatePath("/student/assignments");
}

