/**
 * Seed badge artwork paths into public.badges.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (Supabase Dashboard → Project Settings → API → service_role).
 *
 * Usage: node scripts/seed-badge-images.mjs
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

const BADGES = [
  {
    name: "First Steps",
    description: "Complete your first quiz on MSC Math.",
    image_url: "/badges/junk-boat.png",
    criteria_type: "completion",
    criteria_value: { quizzes_completed: 1 },
    xp_reward: 50,
  },
  {
    name: "Pythagoras Pro",
    description: "Score 90% or higher on a Pythagoras-themed quiz.",
    image_url: "/badges/pythagoras-rainbow.png",
    criteria_type: "score",
    criteria_value: { min_score: 90 },
    xp_reward: 100,
  },
  {
    name: "Book of Wisdom",
    description: "Complete 10 quizzes to unlock the Book of Wisdom.",
    image_url: "/badges/book-of-wisdom.png",
    criteria_type: "completion",
    criteria_value: { completions_required: 10 },
    xp_reward: 150,
  },
  {
    name: "Number Pyramid",
    description: "Reach 80% or higher on a number skills quiz.",
    image_url: "/badges/number-pyramid.png",
    criteria_type: "score",
    criteria_value: { min_score: 80 },
    xp_reward: 80,
  },
  {
    name: "Lighthouse Keeper",
    description: "Keep a 7-day learning streak.",
    image_url: "/badges/lighthouse.png",
    criteria_type: "streak",
    criteria_value: { streak_days: 7 },
    xp_reward: 120,
  },
  {
    name: "Munsang Banner",
    description: "Show school spirit by completing your first assignment.",
    image_url: "/badges/munsang-banner.png",
    criteria_type: "completion",
    criteria_value: { completions_required: 1 },
    xp_reward: 60,
  },
  {
    name: "Munsang Spirit",
    description: "Wear the spirit — maintain a 14-day streak.",
    image_url: "/badges/munsang-jacket.png",
    criteria_type: "streak",
    criteria_value: { streak_days: 14 },
    xp_reward: 200,
  },
  {
    name: "Munsang Gate",
    description: "Pass through the gate: complete 5 quizzes.",
    image_url: "/badges/munsang-gate.png",
    criteria_type: "completion",
    criteria_value: { completions_required: 5 },
    xp_reward: 100,
  },
  {
    name: "Minsheng Torch",
    description: "Light the torch with a 3-day streak.",
    image_url: "/badges/minsheng-torch.png",
    criteria_type: "streak",
    criteria_value: { streak_days: 3 },
    xp_reward: 50,
  },
  {
    name: "Centenary Scholar",
    description: "Score a perfect 100% on any quiz.",
    image_url: "/badges/centenary-stand.png",
    criteria_type: "score",
    criteria_value: { min_score: 100 },
    xp_reward: 250,
  },
  {
    name: "Speech Day Star",
    description: "Stand out on Speech Day — earn this special MSC badge.",
    image_url: "/badges/speech-day-2026.png",
    criteria_type: "custom",
    criteria_value: {
      notes: "Awarded by teachers for outstanding performance.",
    },
    xp_reward: 300,
  },
  {
    name: "Campus Champion",
    description: "Master the campus challenge: complete 20 quizzes.",
    image_url: "/badges/campus-aerial.png",
    criteria_type: "completion",
    criteria_value: { completions_required: 20 },
    xp_reward: 300,
  },
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

const { data: existing, error: listError } = await supabase
  .from("badges")
  .select("id, name, image_url");

if (listError) {
  console.error("Failed to list badges:", listError.message);
  process.exit(1);
}

const byName = new Map((existing ?? []).map((row) => [row.name, row]));
let updated = 0;
let inserted = 0;
let skipped = 0;

for (const badge of BADGES) {
  const current = byName.get(badge.name);
  if (current) {
    if (current.image_url === badge.image_url) {
      skipped += 1;
      continue;
    }
    const { error } = await supabase
      .from("badges")
      .update({ image_url: badge.image_url })
      .eq("id", current.id);
    if (error) {
      console.error(`Failed to update ${badge.name}:`, error.message);
      process.exit(1);
    }
    updated += 1;
    continue;
  }

  const { error } = await supabase.from("badges").insert(badge);
  if (error) {
    console.error(`Failed to insert ${badge.name}:`, error.message);
    process.exit(1);
  }
  inserted += 1;
}

console.log(
  `Badge seed complete. inserted=${inserted} updated=${updated} skipped=${skipped}`,
);
