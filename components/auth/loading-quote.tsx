import { Sparkles } from "lucide-react";

import { getRandomGrowthQuote } from "@/lib/auth/get-random-growth-quote";

export default async function LoadingQuote() {
  const quote = await getRandomGrowthQuote();

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-msc-yellow/40 bg-msc-yellow/10 p-4">
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-msc-red" />
      <div>
        <p className="text-sm leading-relaxed text-msc-ink">
          &ldquo;{quote.quote_text}&rdquo;
        </p>
        {quote.author && (
          <p className="mt-1 text-xs text-gray-500">— {quote.author}</p>
        )}
      </div>
    </div>
  );
}
