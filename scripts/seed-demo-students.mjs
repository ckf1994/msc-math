/**
 * Seed 10 demo student accounts + attempt data.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (Supabase Dashboard → Project Settings → API → service_role).
 *
 * Usage: node scripts/seed-demo-students.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = "DemoStudent123!";

const DEMO_STUDENTS = [
  { email: "student01@test.msc.edu.hk", fullName: "Amy Wong", className: "1A", xp: 420, streak: 5, longest: 7, scores: [5, 4] },
  { email: "student02@test.msc.edu.hk", fullName: "Brian Lee", className: "1A", xp: 310, streak: 3, longest: 4, scores: [3, 4] },
  { email: "student03@test.msc.edu.hk", fullName: "Chloe Ng", className: "1A", xp: 560, streak: 8, longest: 9, scores: [5, 5, 4] },
  { email: "student04@test.msc.edu.hk", fullName: "David Ho", className: "1A", xp: 180, streak: 1, longest: 2, scores: [2] },
  { email: "student05@test.msc.edu.hk", fullName: "Eva Lam", className: "1B", xp: 390, streak: 4, longest: 6, scores: [4, 3] },
  { email: "student06@test.msc.edu.hk", fullName: "Frank Tam", className: "1B", xp: 250, streak: 2, longest: 3, scores: [3, 2] },
  { email: "student07@test.msc.edu.hk", fullName: "Grace Yip", className: "1B", xp: 610, streak: 9, longest: 10, scores: [5, 5, 5] },
  { email: "student08@test.msc.edu.hk", fullName: "Henry Kwok", className: "1B", xp: 340, streak: 3, longest: 5, scores: [4, 3] },
  { email: "student09@test.msc.edu.hk", fullName: "Iris Cheung", className: "1B", xp: 470, streak: 6, longest: 8, scores: [4, 5] },
  { email: "student10@test.msc.edu.hk", fullName: "Jack Mak", className: "1B", xp: 150, streak: 0, longest: 1, scores: [1] },
];

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureClass(name) {
  const { data: existing, error: findError } = await supabase
    .from("classes")
    .select("id, name")
    .eq("name", name)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("classes")
    .insert({ name, form_level: 1, academic_year: "2025-2026" })
    .select("id, name")
    .single();

  if (createError) throw createError;
  return created;
}

async function ensureAuthUser(student) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  const existing = listed.users.find(
    (user) => user.email?.toLowerCase() === student.email.toLowerCase(),
  );
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email: student.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: student.fullName },
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  console.log("Seeding demo students...");

  const class1A = await ensureClass("1A");
  const class1B = await ensureClass("1B");
  const classByName = { "1A": class1A, "1B": class1B };

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("title", "Directed Numbers — Demo Quiz")
    .maybeSingle();
  if (quizError) throw quizError;
  if (!quiz) {
    throw new Error(
      'Demo quiz "Directed Numbers — Demo Quiz" not found. Run supabase/seed.sql first.',
    );
  }

  const { data: teacher } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "teacher@test.msc.edu.hk")
    .maybeSingle();

  const assignmentByClass = {};
  if (teacher?.id) {
    for (const className of ["1A", "1B"]) {
      const klass = classByName[className];
      const title = `Directed Numbers Practice — ${className}`;
      const { data: existingAssignment } = await supabase
        .from("assignments")
        .select("id")
        .eq("title", title)
        .eq("class_id", klass.id)
        .maybeSingle();

      if (existingAssignment) {
        assignmentByClass[className] = existingAssignment.id;
        continue;
      }

      const { data: createdAssignment, error: assignmentError } = await supabase
        .from("assignments")
        .insert({
          quiz_id: quiz.id,
          class_id: klass.id,
          assigned_by: teacher.id,
          title,
          instructions: "Demo assignment for analytics testing.",
          allow_comments: true,
        })
        .select("id")
        .single();

      if (assignmentError) throw assignmentError;
      assignmentByClass[className] = createdAssignment.id;
    }
  }

  for (const student of DEMO_STUDENTS) {
    const userId = await ensureAuthUser(student);
    const klass = classByName[student.className];

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "student",
        is_test_account: true,
        full_name: student.fullName,
        total_xp: student.xp,
        current_streak: student.streak,
        longest_streak: student.longest,
      })
      .eq("id", userId);
    if (profileError) throw profileError;

    const { error: memberError } = await supabase.from("class_members").upsert(
      {
        class_id: klass.id,
        user_id: userId,
        role_in_class: "student",
      },
      { onConflict: "class_id,user_id" },
    );
    if (memberError) throw memberError;

    // Clear prior demo attempts for this student+quiz so re-runs stay idempotent.
    await supabase
      .from("attempts")
      .delete()
      .eq("user_id", userId)
      .eq("quiz_id", quiz.id);

    const assignmentId = assignmentByClass[student.className] ?? null;
    const maxScore = 5;

    for (const [index, score] of student.scores.entries()) {
      const completedAt = new Date(
        Date.now() - (student.scores.length - index) * 36e5 * 18,
      ).toISOString();
      const startedAt = new Date(
        new Date(completedAt).getTime() - (4 + score) * 60 * 1000,
      ).toISOString();

      const { error: attemptError } = await supabase.from("attempts").insert({
        user_id: userId,
        quiz_id: quiz.id,
        assignment_id: assignmentId,
        started_at: startedAt,
        completed_at: completedAt,
        time_spent_seconds: (4 + score) * 60,
        score,
        max_score: maxScore,
        xp_earned: score * 10 + (score === maxScore ? 20 : 0),
        status: "completed",
      });
      if (attemptError) throw attemptError;
    }

    console.log(
      `✓ ${student.fullName} <${student.email}> → ${student.className} (${student.scores.length} attempts)`,
    );
  }

  console.log("\nDone.");
  console.log(`Password for all demo students: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
