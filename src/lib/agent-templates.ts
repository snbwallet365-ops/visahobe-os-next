import { DEFAULT_SYSTEM_PROMPT } from "@/lib/agent-engine";

export type AgentTemplate = {
  id: string;
  contentKey: string; // sa.tplN prefix for editable title/desc
  name: string;
  role: "customer_support" | "supervisor";
  description: string;
  systemPrompt: string;
  tools: string[];
  emoji: string;
};

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "whatsapp_support",
    contentKey: "sa.tpl1",
    name: "WhatsApp Support Agent",
    role: "customer_support",
    description: "Answers customers on WhatsApp 24/7, tracks orders and opens tickets.",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    tools: ["lookup_order", "create_ticket", "escalate_to_human"],
    emoji: "💬",
  },
  {
    id: "sales_assistant",
    contentKey: "sa.tpl2",
    name: "Sales Assistant",
    role: "customer_support",
    description: "Qualifies leads, answers pricing questions and books demos.",
    systemPrompt: `You are a friendly sales assistant on WhatsApp.

Goals:
- Understand what the prospect needs in 1–2 questions.
- Share pricing clearly and capture the lead with capture_lead.
- Offer a demo call and book it with book_appointment.
- Keep replies short and upbeat. Never pressure the customer.`,
    tools: ["capture_lead", "book_appointment", "escalate_to_human"],
    emoji: "💼",
  },
  {
    id: "booking_concierge",
    contentKey: "sa.tpl3",
    name: "Booking Concierge",
    role: "customer_support",
    description: "Books appointments and answers questions about hours and services.",
    systemPrompt: `You are a booking concierge on WhatsApp.

Goals:
- Help customers pick a service and time slot.
- Always confirm date/time before calling book_appointment.
- Business hours: Mon–Sat, 9:00–19:00.
- If a customer wants to cancel or has a complaint, escalate to a human.`,
    tools: ["book_appointment", "escalate_to_human"],
    emoji: "📅",
  },
  {
    id: "supervisor",
    contentKey: "sa.tpl4",
    name: "Supervisor Agent",
    role: "supervisor",
    description: "Routes every incoming message and delegates backend tasks.",
    systemPrompt: `You are the supervisor agent that receives every incoming WhatsApp message.

Responsibilities:
1. Classify intent: order_status, refund, booking, sales, other.
2. Execute the matching backend task (lookup_order, create_ticket, book_appointment, capture_lead).
3. Reply to the customer with the outcome in one short message.
4. Escalate to a human for complaints, legal issues or VIP customers.`,
    tools: ["lookup_order", "create_ticket", "book_appointment", "capture_lead", "escalate_to_human"],
    emoji: "🛡️",
  },
];

export function getTemplate(id: string | null | undefined) {
  return AGENT_TEMPLATES.find((t) => t.id === id) ?? AGENT_TEMPLATES[0];
}
