import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminChatMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { AdminAssistant } from "@/components/admin/assistant";
import { FIELDS, SECTIONS } from "@/lib/site-fields";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const admin = await requireAdmin();
  const messages = await db.select().from(adminChatMessages).where(eq(adminChatMessages.userId, admin.id)).orderBy(asc(adminChatMessages.id)).limit(200);
  return (
    <AdminAssistant
      messages={messages.map((m) => ({ id: m.id, role: m.role, content: m.content, changes: m.changes }))}
      fieldCount={FIELDS.length}
      sectionCount={SECTIONS.length}
      llm={!!process.env.OPENAI_API_KEY}
    />
  );
}
