"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { ArrowUp, Eye, Loader2, MessageSquare, RotateCw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { adminChatAction, clearAdminChatAction } from "@/app/actions/admin";
import { FIELD_MAP } from "@/lib/site-fields";
import { cn } from "@/lib/utils";

type Msg = { id: number; role: string; content: string; changes: Record<string, string> };

const SUGGESTIONS = [
  "Change accent color to blue",
  'Set hero headline to "Build anything with AI"',
  'Replace "Start building" with "Get started"',
  "Change brand name to Visa44",
  "Change font to Poppins",
  "Dark mode",
  "Light mode",
  "Show colors",
  "Undo",
  "Help",
];

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

function Rich({ text }: { text: string }) {
  return (
    <div className="prose-chat space-y-1">
      {text.split("\n").map((l, i) => (l.trim() ? <div key={i} className={l.startsWith("•") ? "pl-1" : ""}>{inline(l)}</div> : <div key={i} className="h-1.5" />))}
    </div>
  );
}

export function AdminAssistant({ messages, fieldCount, sectionCount, llm }: { messages: Msg[]; fieldCount: number; sectionCount: number; llm: boolean }) {
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const [optimistic, add] = useOptimistic(messages, (s: Msg[], m: Msg) => [...s, m]);
  const [pane, setPane] = useState<"chat" | "preview">("chat");
  const [previewKey, setPreviewKey] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(messages.length);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [optimistic.length, pending]);
  useEffect(() => {
    if (messages.length !== prevCount.current) {
      prevCount.current = messages.length;
      setPreviewKey((k) => k + 1);
    }
  }, [messages.length]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || pending) return;
    setInput("");
    start(async () => {
      add({ id: -Date.now(), role: "user", content: t, changes: {} });
      await adminChatAction(t);
    });
  };

  return (
    <div className="flex h-[calc(100dvh-56px-76px)] flex-col bg-page md:h-[100dvh]">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent"><Sparkles className="h-4 w-4" /></span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold">AI Site Assistant</div>
            <div className="truncate text-[11.5px] text-fg-3">Knows {fieldCount} fields · {sectionCount} sections · {llm ? "LLM mode" : "Command mode"}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-full bg-panel p-0.5 lg:hidden">
            {([["chat", MessageSquare], ["preview", Eye]] as const).map(([k, I]) => (
              <button key={k} onClick={() => setPane(k)} className={cn("grid h-8 w-10 place-items-center rounded-full transition", pane === k ? "bg-card text-fg shadow-sm" : "text-fg-3")} aria-label={k}>
                <I className="h-4 w-4" />
              </button>
            ))}
          </div>
          <form action={clearAdminChatAction}>
            <button className="grid h-9 w-9 place-items-center rounded-full text-fg-3 hover:bg-panel hover:text-fg" title="Clear chat" aria-label="Clear chat"><Trash2 className="h-4 w-4" /></button>
          </form>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Chat */}
        <div className={cn("min-h-0 w-full flex-col lg:flex lg:w-[460px] lg:shrink-0 lg:border-r lg:border-line", pane === "chat" ? "flex" : "hidden")}>
          <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
            {optimistic.length === 0 && (
              <div className="animate-rise mx-auto max-w-sm pt-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent"><Wand2 className="h-7 w-7" /></div>
                <h2 className="mt-4 text-[20px] font-semibold tracking-tight">Edit your site by chatting</h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg-2">
                  I know every letter and color on the frontend. Tell me what to change — headline, buttons, pricing, colors, font — and it goes live instantly.
                </p>
              </div>
            )}
            {optimistic.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-[18px] rounded-br-md bg-primary px-4 py-2.5 text-[14px] leading-relaxed text-primary-fg">{m.content}</div>
              ) : (
                <div key={m.id} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><Sparkles className="h-3.5 w-3.5" /></span>
                  <div className="min-w-0 max-w-[88%] rounded-[18px] rounded-tl-md border border-line bg-card px-4 py-3 text-[14px] leading-relaxed text-fg-2 shadow-sm">
                    <Rich text={m.content} />
                    {Object.keys(m.changes ?? {}).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
                        {Object.entries(m.changes).slice(0, 12).map(([k, v]) => (
                          <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            {FIELD_MAP[k]?.type === "color" && <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ background: v }} />}
                            {FIELD_MAP[k]?.label ?? k}
                          </span>
                        ))}
                        {Object.keys(m.changes).length > 12 && <span className="text-[11px] text-fg-3">+{Object.keys(m.changes).length - 12} more</span>}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            {pending && (
              <div className="flex items-center gap-2.5 text-[13px] text-fg-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/10 text-accent"><Loader2 className="h-3.5 w-3.5 animate-spin" /></span> Applying changes…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-line p-3">
            <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={pending} className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-[12px] text-fg-2 transition hover:border-accent/40 hover:text-fg active:scale-95 disabled:opacity-50">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2 rounded-card border border-line bg-card p-1.5 shadow-sm focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1}
                placeholder='e.g. Set pricing title to "Simple pricing"'
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2 text-[15px] placeholder:text-fg-3 outline-none"
              />
              <button onClick={() => send()} disabled={!input.trim() || pending} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:bg-accent-hover disabled:opacity-40" aria-label="Send">
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className={cn("min-h-0 flex-1 flex-col bg-panel lg:flex", pane === "preview" ? "flex" : "hidden")}>
          <div className="flex items-center justify-between border-b border-line bg-page px-4 py-2 text-[12.5px] text-fg-3">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" /> Live preview</span>
            <button onClick={() => setPreviewKey((k) => k + 1)} className="flex items-center gap-1 rounded-full px-2 py-1 hover:bg-panel hover:text-fg"><RotateCw className="h-3.5 w-3.5" /> Refresh</button>
          </div>
          <div className="min-h-0 flex-1 p-3">
            <iframe key={previewKey} src="/" title="Live site preview" className="h-full w-full rounded-card border border-line bg-white shadow-float" />
          </div>
        </div>
      </div>
    </div>
  );
}
