import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projectMessages, projects } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { Builder } from "@/components/dashboard/builder";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const pid = Number(id);
  if (!Number.isInteger(pid)) notFound();
  const [project] = await db.select().from(projects).where(and(eq(projects.id, pid), eq(projects.userId, user.id))).limit(1);
  if (!project) notFound();
  const [messages, c] = await Promise.all([
    db.select().from(projectMessages).where(eq(projectMessages.projectId, pid)).orderBy(asc(projectMessages.id)),
    getContent(),
  ]);

  return (
    <Builder
      domain={c["brand.name"].toLowerCase().replace(/[^a-z0-9]+/g, "")}
      project={{ id: project.id, name: project.name, category: project.category, published: project.published, prompt: project.prompt }}
      messages={messages.map((m) => ({ id: m.id, role: m.role, content: m.content }))}
    />
  );
}
