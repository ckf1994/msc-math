import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 text-sm text-msc-ink outline-none transition-colors placeholder:text-gray-400 focus:border-msc-red/50 focus:ring-2 focus:ring-msc-red/10",
        className,
      )}
      {...props}
    />
  );
}
