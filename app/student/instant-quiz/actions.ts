"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/get-profile";

function normalize(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function createInstantQuizAction(formData: FormData) {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") redirect("/");

  const formLevel = normalize(formData.get("formLevel"));
  const difficulty = normalize(formData.get("difficulty"));
  const count = Number(String(formData.get("count") ?? "5"));

  const supabase = await createClient();
  let query = supabase
    .from("questions")
    .select(`
      id,
      topic:topics (
        form_level
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (difficulty) query = query.eq("difficulty", difficulty);

  const { data } = await query.limit(25);
  const filtered = (data ?? []).filter((question) => {
    const topic = Array.isArray(question.topic) ? question.topic[0] : question.topic;
    return formLevel ? String(topic?.form_level ?? "") === formLevel : true;
  });

  const picked = filtered.slice(0, Math.max(1, Math.min(count, 10)));
  if (picked.length === 0) {
    redirect("/student/instant-quiz?error=no-questions");
  }

  const { data: quiz } = await supabase
    .from("quizzes")
    .insert({
      title: "Instant Quiz",
      description: "Generated instant quiz session.",
      type: "quiz",
      time_limit_seconds: 600,
      shuffle_questions: true,
      shuffle_options: true,
      is_published: false,
    })
    .select("id")
    .single();

  if (!quiz) redirect("/student/instant-quiz?error=create-failed");

  await supabase.from("quiz_questions").insert(
    picked.map((question, index) => ({
      quiz_id: quiz.id,
      question_id: question.id,
      sort_order: index,
    })),
  );

  redirect(`/student/instant-quiz?quizId=${quiz.id}&mode=instant`);
}

