import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-btn text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-hover shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--color-accent)_70%,transparent)]",
        dark: "bg-primary text-primary-fg hover:opacity-90",
        secondary: "bg-card text-fg border border-line hover:border-line-strong hover:bg-panel shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        ghost: "text-fg-2 hover:text-fg hover:bg-panel",
        outline: "border border-line-strong text-fg hover:bg-panel",
        danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
