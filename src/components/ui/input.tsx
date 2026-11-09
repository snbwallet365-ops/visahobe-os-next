import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-btn border border-line bg-card px-3.5 text-[15px] text-fg placeholder:text-fg-3 outline-none transition focus:border-accent/60 focus:ring-4 focus:ring-accent/10 sm:text-sm";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(field, "h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_12px_center] bg-no-repeat pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-fg-2", className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-line bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)} {...props} />;
}

export function Badge({ className, tone = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "green" | "accent" | "amber" | "dark" }) {
  const tones = {
    default: "bg-panel text-fg-2 border-line",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accent: "bg-accent/10 text-accent border-accent/20",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    dark: "bg-primary text-primary-fg border-transparent",
  };
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)} {...props} />;
}
