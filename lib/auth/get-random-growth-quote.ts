import { createClient } from "@/lib/supabase/server";

type GrowthQuote = {
  quote_text: string;
  author: string | null;
};

const FALLBACK_QUOTES: GrowthQuote[] = [
  { quote_text: "Mistakes are proof that you are trying.", author: "Unknown" },
  {
    quote_text: "The only way to learn mathematics is to do mathematics.",
    author: "Paul Halmos",
  },
  {
    quote_text:
      "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
];

export async function getRandomGrowthQuote(): Promise<GrowthQuote> {
  // Avoid breaking `next build` when Supabase env vars are not set.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]!;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("growth_quotes")
      .select("quote_text, author")
      .eq("is_active", true)
      .limit(20);

    if (error || !data || data.length === 0) {
      return FALLBACK_QUOTES[
        Math.floor(Math.random() * FALLBACK_QUOTES.length)
      ]!;
    }

    return data[Math.floor(Math.random() * data.length)]!;
  } catch {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]!;
  }
}

