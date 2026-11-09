import { db } from "@/db";
import { superagents } from "@/db/schema";
import { getTemplate } from "@/lib/agent-templates";
import { randomToken } from "@/lib/utils";

export async function createAgentFromTemplate(userId: number, templateId: string | null | undefined, name?: string) {
  const t = getTemplate(templateId);
  const [a] = await db
    .insert(superagents)
    .values({
      userId,
      name: name?.trim() || t.name,
      role: t.role,
      description: t.description,
      systemPrompt: t.systemPrompt,
      verifyToken: `v44_verify_${randomToken(16)}`,
      tools: t.tools,
    })
    .returning({ id: superagents.id });
  return a.id;
}
