import { db } from "@/db";
import { projectMessages, projects } from "@/db/schema";

export function deriveProjectName(prompt: string) {
  const cleaned = prompt
    .replace(/^(build|create|make|design|i want|i need|please)\s+(me\s+)?(an?\s+)?/i, "")
    .replace(/[^\w\s-]/g, "")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 4).join(" ");
  if (!words) return "Untitled app";
  return words.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildAssistantReply(prompt: string, category: string) {
  const lower = prompt.toLowerCase();
  const entities: string[] = [];
  if (/shop|store|commerce|product/.test(lower)) entities.push("Product", "Order", "Customer");
  if (/crm|lead|sales|client/.test(lower)) entities.push("Lead", "Deal", "Contact");
  if (/task|todo|project|kanban/.test(lower)) entities.push("Task", "Board", "Member");
  if (/book|appointment|schedul/.test(lower)) entities.push("Booking", "Service", "Customer");
  if (/game/.test(lower) || category === "Games") entities.push("Player", "Score", "Level");
  if (/blog|content|post/.test(lower)) entities.push("Post", "Author", "Comment");
  if (!entities.length) entities.push("Item", "User", "Activity");
  const unique = Array.from(new Set(entities));

  return `I've set up your ${category.toLowerCase().replace(/s$/, "")} with a database, authentication and hosting — all built in.

**What I built**
• Responsive UI with a dashboard, list and detail views
• Data entities: ${unique.join(", ")}
• User login (email + Google) and role-based permissions
• Backend functions and file storage

**Next steps you can ask for**
• "Add a Stripe checkout"
• "Send an email when a new ${unique[0].toLowerCase()} is created"
• "Make the design more minimal"`;
}

export function followUpReply(message: string) {
  const lower = message.toLowerCase();
  if (/stripe|payment|checkout/.test(lower)) return "Done — I connected Stripe and added a checkout flow with success and cancel pages. Test mode is enabled until you add live keys in Integrations.";
  if (/email|notify|notification/.test(lower)) return "Added an automation: an email is sent through the built-in Email integration whenever the trigger fires. You can edit the template in Settings → Automations.";
  if (/design|color|minimal|dark|style|theme/.test(lower)) return "Updated the design system: refined typography, more spacing, softer borders and a consistent accent color across buttons and links.";
  if (/agent|ai|chatbot|whatsapp/.test(lower)) return "Added an AI agent connected to your app data. You can manage its instructions and channels (including WhatsApp) under Superagents.";
  if (/login|auth|sign/.test(lower)) return "Authentication updated — users can sign in with email, Google or magic link, and private pages now require login.";
  return `Got it. I applied the change: "${message.slice(0, 120)}". Preview updated — let me know what you'd like next.`;
}

export async function createProjectForUser(userId: number, prompt: string, category: string) {
  const cat = ["Apps", "Websites", "Games", "Tools"].includes(category) ? category : "Apps";
  const [p] = await db
    .insert(projects)
    .values({ userId, prompt, category: cat, name: deriveProjectName(prompt), status: "ready" })
    .returning({ id: projects.id });
  await db.insert(projectMessages).values([
    { projectId: p.id, role: "user", content: prompt },
    { projectId: p.id, role: "assistant", content: buildAssistantReply(prompt, cat) },
  ]);
  return p.id;
}
