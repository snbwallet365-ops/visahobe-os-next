"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import {
  ArrowLeft, Bot, Check, CheckCheck, CircleDot, ClipboardList, Copy, KeyRound, Loader2, MessageCircle, Pause, Play,
  Send, Settings2, ShieldCheck, Sparkles, Trash2, Webhook, Wrench,
} from "lucide-react";
import {
  deleteAgentAction, saveAgentConnectionAction, saveAgentLogicAction, simulateMessageAction, toggleAgentStatusAction, type SaveState,
} from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Badge, Card, Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn, timeAgo } from "@/lib/utils";

type Agent = {
  id: number; name: string; description: string; role: string; systemPrompt: string; model: string; status: string;
  phoneNumberId: string; businessAccountId: string; accessToken: string; verifyToken: string; appSecret: string;
  webhookVerifiedAt: string | null; tools: string[]; escalationKeywords: string; createdAt?: string; userId?: number; channel?: string;
};
type Msg = { id: number; direction: string; contact: string; contactName: string; body: string; status: string; source: string; createdAt: string };
type Task = { id: number; type: string; contact: string; payload: Record<string, unknown>; status: string; createdAt: string };

const TOOLS = [
  { id: "lookup_order", label: "Look up order status", desc: "Query Orders entity by order number" },
  { id: "create_ticket", label: "Create support ticket", desc: "Insert into Tickets when an issue is reported" },
  { id: "book_appointment", label: "Book appointment", desc: "Schedule into Appointments" },
  { id: "capture_lead", label: "Capture lead", desc: "Store prospect details in Leads" },
  { id: "escalate_to_human", label: "Escalate to human", desc: "Hand off & notify your team" },
];

const TEMPLATES: Record<string, string> = {
  customer_support: `You are the customer support agent for our business on WhatsApp.

Goals:
- Greet customers warmly and answer in the language they write in.
- Resolve order, shipping, refund and booking questions using your tools.
- Keep replies short (max 3 sentences) and friendly — this is WhatsApp.
- If the customer is angry or asks for a person, escalate to a human.

Rules:
- Never invent order details. Use lookup_order.
- Always confirm before booking an appointment.
- Business hours: Mon–Fri, 9:00–18:00.`,
  supervisor: `You are the supervisor agent that receives every incoming WhatsApp message.

Responsibilities:
1. Classify intent: order_status, refund, booking, sales, other.
2. Execute the matching backend task (lookup_order, create_ticket, book_appointment, capture_lead).
3. Reply to the customer with the outcome in one short message.
4. Escalate to a human for complaints, legal issues or VIP customers.

Always log what you did. Never share internal data or other customers' information.`,
};

const TASK_LABEL: Record<string, string> = Object.fromEntries(TOOLS.map((t) => [t.id, t.label]));

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className={cn("flex h-11 min-w-0 flex-1 items-center truncate rounded-btn border border-line bg-panel px-3.5 text-[13px] text-fg-2", mono && "font-mono")}>{value}</div>
        <Button type="button" variant="secondary" size="md" onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function SaveStatus({ state, pending }: { state: SaveState; pending: boolean }) {
  if (pending) return <span className="flex items-center gap-1.5 text-[13px] text-fg-3"><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</span>;
  if (state?.error) return <span className="text-[13px] text-red-600">{state.error}</span>;
  if (state?.ok) return <span className="flex items-center gap-1.5 text-[13px] text-emerald-600"><Check className="h-3.5 w-3.5" />Saved</span>;
  return null;
}

/* ---------------- Conversations ---------------- */

function Conversations({ agent, messages }: { agent: Agent; messages: Msg[] }) {
  const contacts = useMemo(() => {
    const map = new Map<string, { contact: string; name: string; last: Msg; count: number }>();
    for (const m of messages) {
      const c = map.get(m.contact);
      map.set(m.contact, { contact: m.contact, name: m.contactName || c?.name || "", last: m, count: (c?.count ?? 0) + 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.last.id - a.last.id);
  }, [messages]);

  const [selected, setSelected] = useState<string>(contacts[0]?.contact ?? "15550001234");
  const [simName, setSimName] = useState("Maria Garcia");
  const [simPhone, setSimPhone] = useState("15550001234");
  const [text, setText] = useState("");
  const [view, setView] = useState<"list" | "thread">(contacts.length ? "list" : "thread");
  const [pending, start] = useTransition();
  const thread = messages.filter((m) => m.contact === selected);
  const [optimistic, addOptimistic] = useOptimistic(thread, (s: Msg[], m: Msg) => [...s, m]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [optimistic.length, selected]);

  const current = contacts.find((c) => c.contact === selected);
  const isNew = selected === "__new__" || (!current && optimistic.length === 0);

  const send = (body?: string) => {
    const msg = (body ?? text).trim();
    if (!msg) return;
    const phone = isNew ? simPhone : selected;
    const name = isNew ? simName : current?.name ?? "";
    setText("");
    setSelected(phone);
    start(async () => {
      addOptimistic({ id: Date.now(), direction: "inbound", contact: phone, contactName: name, body: msg, status: "received", source: "simulator", createdAt: new Date().toISOString() });
      await simulateMessageAction(agent.id, phone, name, msg);
    });
  };

  return (
    <div className="grid h-[calc(100dvh-290px)] min-h-[460px] overflow-hidden rounded-card border border-line bg-card lg:h-auto lg:min-h-[600px] lg:grid-cols-[280px_1fr]">
      <div className={cn("min-h-0 flex-col border-line lg:flex lg:border-r", view === "list" ? "flex" : "hidden")}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-[13px] font-semibold">Chats <span className="text-fg-3">{contacts.length}</span></span>
          <button onClick={() => { setSelected("__new__"); setView("thread"); }} className="rounded-full bg-accent/10 px-3 py-1 text-[12px] font-medium text-accent hover:bg-accent/15">+ Test chat</button>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto lg:max-h-[540px]">
          {contacts.length === 0 && <p className="px-4 py-6 text-[13px] text-fg-3">No conversations yet. Send a test message from the simulator or connect your WhatsApp webhook.</p>}
          {contacts.map((c) => (
            <button key={c.contact} onClick={() => { setSelected(c.contact); setView("thread"); }} className={cn("flex w-full items-center gap-3 border-b border-line/60 px-4 py-3 text-left transition", selected === c.contact ? "bg-panel" : "hover:bg-panel/60")}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366]/15 text-[12px] font-semibold text-[#128C7E]">{(c.name || c.contact).slice(0, 2).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13.5px] font-medium">{c.name || `+${c.contact}`}</span>
                  <span className="shrink-0 text-[11px] text-fg-3">{timeAgo(c.last.createdAt)}</span>
                </span>
                <span className="block truncate text-[12.5px] text-fg-3">{c.last.direction === "outbound" && "🤖 "}{c.last.body}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={cn("min-h-0 flex-col lg:flex lg:min-h-[560px]", view === "thread" ? "flex" : "hidden")}>
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5 md:px-5 md:py-3">
          <button onClick={() => setView("list")} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-fg-2 hover:bg-panel lg:hidden" aria-label="Back to chats"><ArrowLeft className="h-4 w-4" /></button>
          {isNew ? (
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <span className="hidden text-[13px] font-semibold sm:inline">Simulate a customer:</span>
              <Input value={simName} onChange={(e) => setSimName(e.target.value)} placeholder="Name" className="h-8 w-28 text-[13px] sm:w-36" />
              <Input value={simPhone} onChange={(e) => setSimPhone(e.target.value.replace(/\D/g, ""))} placeholder="Phone (wa_id)" className="h-8 w-32 font-mono text-[13px] sm:w-40" />
            </div>
          ) : (
            <div>
              <div className="text-[14px] font-semibold">{current?.name || `+${selected}`}</div>
              <div className="font-mono text-[11.5px] text-fg-3">+{selected} · {current?.count} messages</div>
            </div>
          )}
          <Badge className="shrink-0" tone={agent.status === "active" ? "green" : "amber"}>{agent.status === "active" ? "Replying" : "Paused"}</Badge>
        </div>

        <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto bg-[#efeae2] bg-[radial-gradient(rgba(0,0,0,0.035)_1px,transparent_1px)] [background-size:18px_18px] p-5">
          {(isNew ? [] : optimistic).map((m) => (
            <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] rounded-[10px] px-3 py-2 text-[13.5px] leading-relaxed shadow", m.direction === "outbound" ? "rounded-tr-sm bg-[#d9fdd3] text-zinc-900" : "rounded-tl-sm bg-white text-zinc-900")}>
                <div className="whitespace-pre-wrap">{m.body}</div>
                <div className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-fg/50">
                  {m.source === "simulator" && <span>sim ·</span>}
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {m.direction === "outbound" && (m.status === "failed" ? <span className="text-red-600">failed</span> : <CheckCheck className="h-3 w-3 text-sky-500" />)}
                </div>
              </div>
            </div>
          ))}
          {pending && <div className="flex justify-end"><div className="flex items-center gap-1.5 rounded-[10px] bg-[#d9fdd3] px-3 py-2 text-[12px] text-zinc-600"><Loader2 className="h-3 w-3 animate-spin" />Agent is typing…</div></div>}
          {isNew && (
            <div className="grid h-full place-items-center text-center">
              <div>
                <MessageCircle className="mx-auto h-8 w-8 text-[#25D366]" />
                <p className="mt-3 text-[13px] text-fg-3">Type a message as a customer to test your agent.</p>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-line bg-[#f0f2f5] p-3">
          <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
            {["Hi there!", "Where is my order #48213?", "My item arrived broken", "Can I book a demo call?", "I want to talk to a human"].map((s) => (
              <button key={s} onClick={() => send(s)} disabled={pending} className="shrink-0 rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] text-fg-2 transition hover:border-line-strong hover:text-fg disabled:opacity-50">{s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message as the customer…" className="bg-white" />
            <Button onClick={() => send()} disabled={pending || !text.trim()} className="bg-[#00a884] shadow-none hover:bg-[#06cf9c]" size="md"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Webhook ---------------- */

function WebhookPanel({ agent, webhookUrl }: { agent: Agent; webhookUrl: string }) {
  const [state, action, pending] = useActionState(saveAgentConnectionAction.bind(null, agent.id), undefined);
  const connected = !!agent.accessToken && !!agent.phoneNumberId;
  const curl = `curl -X POST '${webhookUrl}' \\
  -H 'Content-Type: application/json' \\
  -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"field":"messages","value":{"contacts":[{"wa_id":"15551234567","profile":{"name":"Test User"}}],"messages":[{"from":"15551234567","type":"text","text":{"body":"Where is my order 12345?"}}]}}]}]}'`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-semibold"><Webhook className="h-4 w-4 text-accent" /> Webhook endpoint</div>
            {agent.webhookVerifiedAt ? <Badge tone="green"><Check className="h-3 w-3" />Verified by Meta</Badge> : <Badge tone="amber">Awaiting verification</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-fg-3">Paste these into Meta App Dashboard → WhatsApp → Configuration → Webhook, then subscribe to the <code className="text-fg-2">messages</code> field.</p>
          <div className="mt-5 grid gap-4">
            <CopyField label="Callback URL" value={webhookUrl} />
            <CopyField label="Verify token" value={agent.verifyToken} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-semibold"><KeyRound className="h-4 w-4 text-accent" /> WhatsApp Business API credentials</div>
            {connected ? <Badge tone="green">Sending enabled</Badge> : <Badge>Simulation mode</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-fg-3">Required to send replies through the WhatsApp Cloud API. Without them, replies are logged but not delivered.</p>
          <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phoneNumberId">Phone number ID</Label>
              <Input id="phoneNumberId" name="phoneNumberId" defaultValue={agent.phoneNumberId} placeholder="109876543210987" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="businessAccountId">WhatsApp Business Account ID</Label>
              <Input id="businessAccountId" name="businessAccountId" defaultValue={agent.businessAccountId} placeholder="102345678901234" className="font-mono" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="accessToken">Permanent access token</Label>
              <Input id="accessToken" name="accessToken" type="password" defaultValue={agent.accessToken} placeholder="EAAG…" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="appSecret">App secret <span className="text-fg-3">(signature check)</span></Label>
              <Input id="appSecret" name="appSecret" type="password" defaultValue={agent.appSecret} placeholder="Optional" className="font-mono" />
            </div>
            <div>
              <Label htmlFor="verifyToken">Verify token</Label>
              <Input id="verifyToken" name="verifyToken" defaultValue={agent.verifyToken} className="font-mono" />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Button type="submit" disabled={pending}>Save connection</Button>
              <SaveStatus state={state} pending={pending} />
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="text-[15px] font-semibold">Test with cURL</div>
          <p className="mt-1 text-[13px] text-fg-3">Sends a payload in the exact WhatsApp Cloud API format. {agent.appSecret && "Signature check is enabled — remove the app secret to test without x-hub-signature-256."}</p>
          <pre className="scrollbar-thin mt-4 overflow-x-auto rounded-btn border border-line bg-panel p-4 font-mono text-[12px] leading-relaxed text-fg-2">{curl}</pre>
        </Card>
      </div>

      <Card className="h-fit p-6">
        <div className="text-[15px] font-semibold">Setup checklist</div>
        <ol className="mt-4 space-y-4">
          {[
            { t: "Create a Meta app", d: "Add the WhatsApp product at developers.facebook.com", done: true },
            { t: "Add credentials", d: "Phone number ID and permanent token", done: connected },
            { t: "Verify the webhook", d: "Meta calls GET with hub.challenge", done: !!agent.webhookVerifiedAt },
            { t: "Subscribe to messages", d: "Incoming messages start flowing to your agent", done: !!agent.webhookVerifiedAt },
            { t: "Activate the agent", d: "Agent replies automatically 24/7", done: agent.status === "active" },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold", s.done ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-line text-fg-3")}>
                {s.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div>
                <div className="text-[13.5px] font-medium">{s.t}</div>
                <div className="text-[12px] text-fg-3">{s.d}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

/* ---------------- Logic ---------------- */

function LogicPanel({ agent, llmEnabled }: { agent: Agent; llmEnabled: boolean }) {
  const [state, action, pending] = useActionState(saveAgentLogicAction.bind(null, agent.id), undefined);
  const [prompt, setPrompt] = useState(agent.systemPrompt);
  const [role, setRole] = useState(agent.role);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Settings2 className="h-4 w-4 text-accent" /> Identity</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="name">Agent name</Label>
              <Input id="name" name="name" defaultValue={agent.name} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer_support">Customer support</option>
                <option value="supervisor">Supervisor</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select id="model" name="model" defaultValue={agent.model}>
                <option value="gpt-4o-mini">GPT-4o mini</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-sonnet">Claude Sonnet</option>
                <option value="gemini-flash">Gemini Flash</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[15px] font-semibold"><Bot className="h-4 w-4 text-accent" /> Instructions (system prompt)</div>
            <div className="flex gap-1.5">
              <Button type="button" size="sm" variant="secondary" onClick={() => { setPrompt(TEMPLATES.customer_support); setRole("customer_support"); }}>Support template</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => { setPrompt(TEMPLATES.supervisor); setRole("supervisor"); }}>Supervisor template</Button>
            </div>
          </div>
          <Textarea name="systemPrompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={16} className="mt-4 font-mono text-[13px]" />
          <div className="mt-2 text-right text-[11.5px] text-fg-3">{prompt.length} characters</div>
          <div className="mt-4">
            <Label htmlFor="escalationKeywords">Escalation keywords (comma separated)</Label>
            <Input id="escalationKeywords" name="escalationKeywords" defaultValue={agent.escalationKeywords} />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold"><Wrench className="h-4 w-4 text-accent" /> Backend tasks</div>
          <p className="mt-1 text-[12.5px] text-fg-3">Tools the agent can execute against your app&apos;s entities.</p>
          <div className="mt-4 space-y-2">
            {TOOLS.map((t) => (
              <label key={t.id} className="flex cursor-pointer gap-3 rounded-btn border border-line bg-panel/60 p-3 transition hover:border-line-strong has-[:checked]:border-accent/40 has-[:checked]:bg-accent/5">
                <input type="checkbox" name="tools" value={t.id} defaultChecked={agent.tools.includes(t.id)} className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]" />
                <span>
                  <span className="block text-[13.5px] font-medium">{t.label}</span>
                  <span className="block text-[12px] text-fg-3">{t.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[13px] font-medium"><Sparkles className="h-4 w-4 text-accent" /> Reasoning engine</div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-3">
            {llmEnabled ? "OPENAI_API_KEY detected — replies are generated by the LLM with tool calling." : "Running the built-in intent engine. Add OPENAI_API_KEY to the environment to enable LLM replies with tool calling."}
          </p>
        </Card>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending} className="flex-1">Save agent</Button>
          <SaveStatus state={state} pending={pending} />
        </div>
      </div>
    </form>
  );
}

/* ---------------- Tasks ---------------- */

function TasksPanel({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-[160px_1fr_140px_100px_90px] gap-4 border-b border-line px-5 py-3 text-[12px] font-medium uppercase tracking-wider text-fg-3 max-md:hidden">
        <span>Task</span><span>Payload</span><span>Contact</span><span>Status</span><span>When</span>
      </div>
      {tasks.length === 0 && <p className="px-5 py-10 text-center text-[13px] text-fg-3">No tasks executed yet. Tasks appear when the agent runs a tool during a conversation.</p>}
      {tasks.map((t) => (
        <div key={t.id} className="grid gap-2 border-b border-line/60 px-5 py-3 text-[13px] last:border-0 md:grid-cols-[160px_1fr_140px_100px_90px] md:gap-4">
          <span className="flex items-center gap-2 font-medium"><CircleDot className="h-3.5 w-3.5 text-accent" />{TASK_LABEL[t.type] ?? t.type}</span>
          <span className="truncate font-mono text-[12px] text-fg-2">{JSON.stringify(t.payload)}</span>
          <span className="font-mono text-[12px] text-fg-3">+{t.contact}</span>
          <span><Badge tone={t.status === "completed" ? "green" : "amber"}>{t.status}</Badge></span>
          <span className="text-[12px] text-fg-3">{timeAgo(t.createdAt)}</span>
        </div>
      ))}
    </Card>
  );
}

/* ---------------- Hub ---------------- */

export function AgentHub({ agent, messages, tasks, webhookUrl, llmEnabled }: { agent: Agent; messages: Msg[]; tasks: Task[]; webhookUrl: string; llmEnabled: boolean }) {
  const [tab, setTab] = useState<"conversations" | "webhook" | "logic" | "tasks">("conversations");
  const router = useRouter();

  useEffect(() => {
    if (tab !== "conversations" && tab !== "tasks") return;
    const t = setInterval(() => router.refresh(), 6000);
    return () => clearInterval(t);
  }, [tab, router]);

  const inbound = messages.filter((m) => m.direction === "inbound").length;
  const outbound = messages.filter((m) => m.direction === "outbound").length;

  const TABS = [
    { id: "conversations", label: "Chats", icon: MessageCircle },
    { id: "webhook", label: "Webhook", icon: Webhook },
    { id: "logic", label: "Logic & Instructions", icon: Bot },
    { id: "tasks", label: `Tasks (${tasks.length})`, icon: ClipboardList },
  ] as const;

  return (
    <div className="min-h-[100dvh] bg-panel">
      <div className="border-b border-line bg-page px-4 pt-4 md:px-10 md:pt-6">
        <Link href="/dashboard/superagents" className="inline-flex items-center gap-1.5 text-[13px] text-fg-3 hover:text-fg"><ArrowLeft className="h-3.5 w-3.5" /> Superagents</Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden h-12 w-12 shrink-0 md:grid place-items-center rounded-card bg-[#25D366]/10 text-[#128C7E]"><MessageCircle className="h-6 w-6" /></span>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-[19px] font-semibold tracking-tight md:text-[22px]">{agent.name}</h1>
                {agent.status === "active" ? <Badge tone="green"><span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-500" />Running 24/7</Badge> : <Badge tone="amber">Paused</Badge>}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-fg-3 md:text-[13px]">
                {agent.role === "supervisor" ? <ShieldCheck className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                {agent.role === "supervisor" ? "Supervisor agent" : "Customer support agent"} · WhatsApp · {inbound} in / {outbound} out
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <form action={toggleAgentStatusAction.bind(null, agent.id)}>
              <Button variant="secondary" size="sm" className="h-9">{agent.status === "active" ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Activate</>}</Button>
            </form>
            <form action={deleteAgentAction.bind(null, agent.id)}>
              <Button variant="danger" size="icon" title="Delete agent" onClick={(e) => { if (!confirm("Delete this Superagent and all its conversations?")) e.preventDefault(); }}><Trash2 className="h-4 w-4" /></Button>
            </form>
          </div>
        </div>
        <div className="no-scrollbar -mx-1 mt-4 flex gap-0.5 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={cn("relative flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 text-[13.5px] transition", tab === id ? "text-fg" : "text-fg-3 hover:text-fg-2")}>
              <Icon className="h-4 w-4" />{label}
              {tab === id && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-3 py-4 md:px-10 md:py-8">
        {tab === "conversations" && <Conversations agent={agent} messages={messages} />}
        {tab === "webhook" && <WebhookPanel agent={agent} webhookUrl={webhookUrl} />}
        {tab === "logic" && <LogicPanel agent={agent} llmEnabled={llmEnabled} />}
        {tab === "tasks" && <TasksPanel tasks={tasks} />}
      </div>
    </div>
  );
}
