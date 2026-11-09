"use client";

import Link from "next/link";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowUp, Code2, Database, ExternalLink, Globe, Loader2, MessageSquare, Monitor, Smartphone, Sparkles, Trash2 } from "lucide-react";
import { deleteProjectAction, sendProjectMessageAction, togglePublishAction } from "@/app/actions/dashboard";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Msg = { id: number; role: string; content: string };
type P = { id: number; name: string; category: string; published: boolean; prompt: string };

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    const bold = line.match(/^\*\*(.+)\*\*$/);
    if (bold) return <div key={i} className="mt-3 font-semibold text-fg first:mt-0">{bold[1]}</div>;
    if (!line.trim()) return <div key={i} className="h-1.5" />;
    return <div key={i}>{line}</div>;
  });
}

function Preview({ project, device }: { project: P; device: "desktop" | "mobile" }) {
  const isGame = project.category === "Games";
  const isSite = project.category === "Websites";
  return (
    <div className={cn("mx-auto h-full overflow-hidden rounded-card border border-line bg-white text-zinc-900 shadow-float transition-all duration-500", device === "mobile" ? "max-w-[380px]" : "max-w-full")}>
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <div className="flex items-center gap-2 text-[14px] font-semibold"><span className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-400 to-rose-500" />{project.name}</div>
        <div className="hidden gap-4 text-[13px] text-zinc-500 sm:flex"><span>Home</span><span>{isGame ? "Leaderboard" : isSite ? "About" : "Dashboard"}</span><span>Settings</span></div>
      </div>
      {isGame ? (
        <div className="grid h-[calc(100%-49px)] place-items-center bg-zinc-950 p-6 text-white">
          <div className="text-center">
            <div className="mx-auto grid w-48 grid-cols-6 gap-1">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className={cn("aspect-square rounded-sm", [7, 8, 9, 15, 21, 27].includes(i) ? "bg-emerald-400" : i === 30 ? "bg-orange-500" : "bg-white/5")} />
              ))}
            </div>
            <div className="mt-6 text-2xl font-bold">Score: 1,240</div>
            <button className="mt-4 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold">Play again</button>
          </div>
        </div>
      ) : isSite ? (
        <div className="h-[calc(100%-49px)] overflow-auto">
          <div className="bg-gradient-to-br from-orange-50 via-rose-50 to-indigo-50 px-6 py-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600">{project.prompt.slice(0, 120)}</p>
            <button className="mt-6 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white">Get started</button>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            {["Fast", "Beautiful", "Yours"].map((t) => (
              <div key={t} className="rounded-xl border border-zinc-200 p-4"><div className="h-8 w-8 rounded-lg bg-orange-100" /><div className="mt-3 font-semibold">{t}</div><div className="mt-1 text-xs text-zinc-500">Crafted from your description.</div></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[calc(100%-49px)] overflow-auto bg-zinc-50 p-4 md:p-6">
          <div className="grid grid-cols-3 gap-3">
            {[["Total", "1,284"], ["This week", "+86"], ["Active", "342"]].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-zinc-200 bg-white p-3"><div className="text-xs text-zinc-500">{k}</div><div className="mt-1 text-xl font-semibold">{v}</div></div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3"><span className="font-semibold">Recent items</span><button className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-medium text-white">+ New</button></div>
            {["Alice Johnson", "Marcus Lee", "Priya Patel", "Tom Weber"].map((n, i) => (
              <div key={n} className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-sm last:border-0">
                <span className="flex items-center gap-3"><span className="h-7 w-7 rounded-full bg-zinc-200" />{n}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs", i % 2 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{i % 2 ? "Pending" : "Active"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Builder({ project, messages, domain }: { project: P; messages: Msg[]; domain: string }) {
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"preview" | "code" | "data">("preview");
  const [mobilePane, setMobilePane] = useState<"chat" | "preview">("chat");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [pending, start] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(messages, (s: Msg[], m: Msg) => [...s, m]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [optimistic.length, mobilePane]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    start(async () => {
      addOptimistic({ id: -Date.now(), role: "user", content: text });
      await sendProjectMessageAction(project.id, text);
    });
  };

  const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="flex h-[calc(100dvh-56px-76px)] flex-col bg-page md:h-[100dvh]">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/dashboard" className="grid h-9 w-9 place-items-center rounded-full text-fg-2 hover:bg-panel"><ArrowLeft className="h-4 w-4" /></Link>
          <span className="truncate text-[14px] font-semibold">{project.name}</span>
          <span className="hidden rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-3 sm:inline">{project.category}</span>
        </div>
        <div className="hidden items-center gap-0.5 rounded-full border border-line bg-panel p-0.5 lg:flex">
          {([["preview", Monitor, "Preview"], ["code", Code2, "Code"], ["data", Database, "Data"]] as const).map(([k, I, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] transition", tab === k ? "bg-card text-fg shadow-sm" : "text-fg-3 hover:text-fg")}>
              <I className="h-3.5 w-3.5" />{l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <form action={deleteProjectAction.bind(null, project.id)}>
            <Button variant="ghost" size="icon" title="Delete project" onClick={(e) => { if (!confirm("Delete this project?")) e.preventDefault(); }}><Trash2 className="h-4 w-4" /></Button>
          </form>
          <form action={togglePublishAction.bind(null, project.id)}>
            <Button size="sm" variant={project.published ? "secondary" : "primary"} className="rounded-full">
              <Globe className="h-3.5 w-3.5" /> {project.published ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile pane switcher */}
      <div className="flex shrink-0 gap-1 border-b border-line p-2 lg:hidden">
        {([["chat", MessageSquare, "Chat"], ["preview", Monitor, "Preview"]] as const).map(([k, I, l]) => (
          <button key={k} onClick={() => setMobilePane(k)} className={cn("flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium transition", mobilePane === k ? "bg-primary text-primary-fg" : "bg-panel text-fg-2")}>
            <I className="h-4 w-4" />{l}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className={cn("min-h-0 w-full flex-col border-line lg:flex lg:w-[420px] lg:border-r", mobilePane === "chat" ? "flex" : "hidden")}>
          <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto p-4 md:p-5">
            {optimistic.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-auto max-w-[85%] rounded-[18px] rounded-br-md bg-panel px-4 py-2.5 text-[14.5px] leading-relaxed">{m.content}</div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <LogoMark className="mt-0.5 h-6 w-6" />
                  <div className="min-w-0 text-[14.5px] leading-relaxed text-fg-2">{renderContent(m.content)}</div>
                </div>
              ),
            )}
            {pending && <div className="flex items-center gap-3 text-[13px] text-fg-3"><LogoMark className="h-6 w-6" /><Loader2 className="h-3.5 w-3.5 animate-spin" /> Building…</div>}
            <div ref={endRef} />
          </div>
          <div className="border-t border-line p-3">
            <div className="rounded-card border border-line bg-card shadow-sm focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                placeholder="Ask for a change…"
                className="block w-full resize-none bg-transparent px-3.5 pt-3 text-[15px] placeholder:text-fg-3 outline-none"
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="flex items-center gap-1 px-1.5 text-[11.5px] text-fg-3"><Sparkles className="h-3 w-3 text-accent" /> 1 credit per message</span>
                <button onClick={send} disabled={!input.trim() || pending} className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white transition hover:bg-accent-hover disabled:opacity-40" aria-label="Send">
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("min-h-0 flex-1 flex-col bg-panel lg:flex", mobilePane === "preview" ? "flex" : "hidden")}>
          <div className="flex items-center justify-between border-b border-line bg-page px-3 py-2">
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[12px] text-fg-3">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", project.published ? "bg-emerald-500" : "bg-fg-3")} />
              <span className="truncate">{slug}.{domain}.app</span>
              {project.published && <ExternalLink className="h-3 w-3 shrink-0" />}
            </div>
            {tab === "preview" && (
              <div className="hidden gap-1 sm:flex">
                <button onClick={() => setDevice("desktop")} className={cn("rounded-md p-1.5", device === "desktop" ? "bg-panel text-fg" : "text-fg-3")}><Monitor className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDevice("mobile")} className={cn("rounded-md p-1.5", device === "mobile" ? "bg-panel text-fg" : "text-fg-3")}><Smartphone className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 p-3 md:p-4">
            {tab === "preview" && <Preview project={project} device={device} />}
            {tab === "code" && (
              <pre className="scrollbar-thin h-full overflow-auto rounded-card border border-line bg-card p-5 font-mono text-[12.5px] leading-relaxed text-fg-2">
{`import { createClient } from "@base44/sdk";

// Auto-generated — schema syncs from chat
const client = createClient({ appId: "${project.id}" });

export async function loadDashboard() {
  const user = await client.auth.me();
  const items = await client.entities.Item.list("-created_date", 20);
  return { user, items };
}

export async function createItem(data) {
  return client.entities.Item.create(data);
}`}
              </pre>
            )}
            {tab === "data" && (
              <div className="h-full overflow-auto rounded-card border border-line bg-card">
                <div className="border-b border-line px-4 py-3 text-[13px] font-semibold">Entities</div>
                {["Item", "User", "Activity"].map((e, i) => (
                  <div key={e} className="flex items-center justify-between border-b border-line px-4 py-3 text-[13px] last:border-0">
                    <span className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-accent" />{e}</span>
                    <span className="text-fg-3">{[128, 42, 1290][i]} records</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
