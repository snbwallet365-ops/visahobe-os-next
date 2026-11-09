import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agentMessages, agentTasks, type Superagent } from "@/db/schema";

export const AGENT_TOOLS = [
  { id: "lookup_order", label: "Look up order status", desc: "Query the Orders entity by order number and reply with status." },
  { id: "create_ticket", label: "Create support ticket", desc: "Open a ticket in the Tickets entity when an issue is reported." },
  { id: "book_appointment", label: "Book appointment", desc: "Schedule a call or visit and save it to Appointments." },
  { id: "capture_lead", label: "Capture lead", desc: "Store contact details for sales follow-up in Leads." },
  { id: "escalate_to_human", label: "Escalate to human", desc: "Hand off the conversation and notify the team." },
] as const;

export const DEFAULT_SYSTEM_PROMPT = `You are the supervisor customer-support agent for our business on WhatsApp.

Goals:
- Greet customers warmly and answer in the language they write in.
- Resolve order, shipping, refund and booking questions using your tools.
- Keep replies short (max 3 sentences) and friendly — this is WhatsApp.
- If the customer is angry or asks for a person, escalate to a human.

Rules:
- Never invent order details. Use lookup_order.
- Always confirm before booking an appointment.
- Business hours: Mon–Fri, 9:00–18:00.`;

type ToolCall = { type: string; payload: Record<string, unknown> };
type Reply = { text: string; tasks: ToolCall[] };

function ruleBasedReply(agent: Superagent, body: string, name: string): Reply {
  const text = body.toLowerCase();
  const tools = new Set(agent.tools);
  const first = name ? name.split(" ")[0] : "there";
  const tasks: ToolCall[] = [];

  const escalate = agent.escalationKeywords
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean)
    .some((k) => text.includes(k));
  if (escalate || /angry|terrible|worst|complain/.test(text)) {
    if (tools.has("escalate_to_human")) {
      tasks.push({ type: "escalate_to_human", payload: { reason: body.slice(0, 140) } });
      return { text: `I'm sorry about that, ${first}. I've escalated this to a teammate — someone will reply here shortly. 🙏`, tasks };
    }
  }

  const orderMatch = body.match(/#?\b(\d{4,})\b/);
  if (/order|track|shipping|delivery|package/.test(text)) {
    if (orderMatch && tools.has("lookup_order")) {
      const statuses = ["shipped 🚚 and arriving in 2 days", "out for delivery today 📦", "being packed and ships tomorrow", "delivered ✅"];
      const status = statuses[Number(orderMatch[1]) % statuses.length];
      tasks.push({ type: "lookup_order", payload: { orderId: orderMatch[1], status } });
      return { text: `Thanks ${first}! Order #${orderMatch[1]} is ${status}. Anything else I can help with?`, tasks };
    }
    return { text: `Happy to check that for you, ${first}! Could you share your order number?`, tasks };
  }

  if (/refund|broken|damaged|wrong item|return|issue|problem|not working/.test(text) && tools.has("create_ticket")) {
    const ticket = `T-${Math.floor(1000 + Math.random() * 9000)}`;
    tasks.push({ type: "create_ticket", payload: { ticket, summary: body.slice(0, 140), priority: /broken|damaged/.test(text) ? "high" : "normal" } });
    return { text: `I'm sorry to hear that. I've opened ticket ${ticket} and our team will follow up within 24h. Could you send a photo if possible?`, tasks };
  }

  if (/book|appointment|schedule|meeting|call me|demo/.test(text) && tools.has("book_appointment")) {
    const when = new Date(Date.now() + 86400000);
    when.setHours(10, 0, 0, 0);
    tasks.push({ type: "book_appointment", payload: { when: when.toISOString(), status: "tentative" } });
    return { text: `Sure! I can book you for tomorrow at 10:00. Reply YES to confirm or suggest another time.`, tasks };
  }

  if (/price|pricing|cost|buy|quote|interested/.test(text) && tools.has("capture_lead")) {
    tasks.push({ type: "capture_lead", payload: { interest: body.slice(0, 140) } });
    return { text: `Great question, ${first}! I've passed your details to our sales team and they'll send a quote today. What's the best email to reach you?`, tasks };
  }

  if (/hours|open|close/.test(text)) {
    return { text: `We're open Mon–Fri, 9:00–18:00. I'm here 24/7 though — how can I help?`, tasks };
  }

  if (/^(hi|hello|hey|hola|good (morning|afternoon|evening))/.test(text.trim())) {
    return { text: `Hi ${first}! 👋 I'm ${agent.name}. I can track orders, open support tickets or book a call. What do you need?`, tasks };
  }

  return { text: `Thanks for your message, ${first}! Could you tell me a bit more so I can help — is it about an order, a return, or something else?`, tasks };
}

async function llmReply(agent: Superagent, contact: string, body: string, name: string): Promise<Reply | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const history = await db
      .select()
      .from(agentMessages)
      .where(and(eq(agentMessages.agentId, agent.id), eq(agentMessages.contact, contact)))
      .orderBy(desc(agentMessages.createdAt))
      .limit(10);
    const tools = AGENT_TOOLS.filter((t) => agent.tools.includes(t.id)).map((t) => ({
      type: "function" as const,
      function: {
        name: t.id,
        description: t.desc,
        parameters: { type: "object", properties: { details: { type: "string" } }, required: ["details"] },
      },
    }));
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: agent.model.startsWith("gpt") ? agent.model : "gpt-4o-mini",
        messages: [
          { role: "system", content: `${agent.systemPrompt}\n\nCustomer name: ${name || "unknown"}. Always reply with a short WhatsApp message even when calling tools.` },
          ...history.reverse().slice(0, -1).map((m) => ({ role: m.direction === "inbound" ? "user" : "assistant", content: m.body })),
          { role: "user", content: body },
        ],
        ...(tools.length ? { tools } : {}),
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const msg = json.choices?.[0]?.message;
    const tasks: ToolCall[] = (msg?.tool_calls ?? []).map((c: { function: { name: string; arguments: string } }) => {
      let payload: Record<string, unknown> = {};
      try { payload = JSON.parse(c.function.arguments); } catch { payload = { raw: c.function.arguments }; }
      return { type: c.function.name, payload };
    });
    const text: string = msg?.content || (tasks.length ? "Done! I've taken care of that for you. ✅" : "");
    if (!text) return null;
    return { text, tasks };
  } catch {
    return null;
  }
}

async function sendWhatsApp(agent: Superagent, to: string, text: string) {
  if (!agent.accessToken || !agent.phoneNumberId) return "simulated";
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${agent.phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${agent.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body: text } }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export async function handleIncomingMessage(
  agent: Superagent,
  opts: { contact: string; contactName?: string; body: string; source: "webhook" | "simulator" },
) {
  const name = opts.contactName ?? "";
  await db.insert(agentMessages).values({
    agentId: agent.id,
    direction: "inbound",
    contact: opts.contact,
    contactName: name,
    body: opts.body,
    status: "received",
    source: opts.source,
  });

  if (agent.status !== "active") return null;

  const reply = (await llmReply(agent, opts.contact, opts.body, name)) ?? ruleBasedReply(agent, opts.body, name);

  if (reply.tasks.length) {
    await db.insert(agentTasks).values(
      reply.tasks.map((t) => ({
        agentId: agent.id,
        type: t.type,
        contact: opts.contact,
        payload: t.payload,
        status: t.type === "escalate_to_human" ? "pending" : "completed",
      })),
    );
  }

  const status = opts.source === "simulator" ? "simulated" : await sendWhatsApp(agent, opts.contact, reply.text);
  await db.insert(agentMessages).values({
    agentId: agent.id,
    direction: "outbound",
    contact: opts.contact,
    contactName: name,
    body: reply.text,
    status,
    source: opts.source,
  });
  return reply;
}
