"use client";

import { useRef, useState } from "react";
import { ArrowUp, AppWindow, Gamepad2, Globe, Paperclip, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { lines, type Content } from "@/lib/site-fields";

export function PromptBox({ c, action = "/start", compact = false }: { c: Content; action?: string; compact?: boolean }) {
  const cats = [
    { id: "Apps", label: c["hero.cat1"], icon: AppWindow },
    { id: "Websites", label: c["hero.cat2"], icon: Globe },
    { id: "Games", label: c["hero.cat3"], icon: Gamepad2 },
    { id: "Tools", label: c["hero.cat4"], icon: Wrench },
  ];
  const [category, setCategory] = useState("Apps");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={action} method="get" className="w-full" onSubmit={() => setSubmitting(true)}>
      <input type="hidden" name="category" value={category} />
      <div className="shadow-float rounded-[calc(var(--radius-card)+6px)] border border-line bg-card transition focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10">
        <textarea
          ref={ref}
          name="prompt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (value.trim()) e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={compact ? 2 : 3}
          placeholder={c["hero.placeholder"]}
          className="block w-full resize-none rounded-t-[inherit] bg-transparent px-4 pt-4 text-[16px] leading-relaxed text-fg placeholder:text-fg-3 outline-none md:px-5 md:pt-5"
        />
        <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5 pt-1 md:px-3 md:pb-3">
          <div className="no-scrollbar flex min-w-0 items-center gap-1.5 overflow-x-auto">
            <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-fg-3 transition hover:bg-panel hover:text-fg" aria-label="Attach">
              <Paperclip className="h-4 w-4" />
            </button>
            {cats.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setCategory(id);
                  ref.current?.focus();
                }}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-all",
                  category === id ? "border-accent/30 bg-accent/10 text-accent" : "border-line bg-card text-fg-2 hover:bg-panel hover:text-fg",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={!value.trim() || submitting}
            aria-label={c["hero.button"]}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">{c["hero.button"]}</span>
            <ArrowUp className={cn("h-4 w-4", submitting && "animate-pulse")} />
          </button>
        </div>
      </div>
      {!compact && (
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:justify-center">
          {lines(c["hero.suggestions"]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setValue(`Build a ${s.toLowerCase()} that `);
                ref.current?.focus();
              }}
              className="shrink-0 rounded-full border border-line bg-card/70 px-3 py-1.5 text-[13px] text-fg-2 backdrop-blur transition hover:border-line-strong hover:text-fg"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
