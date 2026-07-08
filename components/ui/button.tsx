import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-msc-red/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-msc-red text-white shadow-sm hover:bg-msc-red-dark",
        secondary:
          "bg-msc-yellow text-msc-ink shadow-sm hover:bg-msc-yellow-dark",
        outline:
          "border-2 border-msc-red/20 bg-white text-msc-ink hover:border-msc-red/40 hover:bg-msc-red/5",
        ghost: "text-msc-ink hover:bg-msc-red/5",
        google:
          "border-2 border-gray-200 bg-white text-msc-ink shadow-sm hover:bg-gray-50",
      },
      size: {
        default: "h-11 px-5 py-2",
        lg: "h-12 px-6 text-base",
        sm: "h-9 rounded-lg px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
