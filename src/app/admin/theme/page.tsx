import { requireAdmin } from "@/lib/auth";
import { readRawContent } from "@/lib/content";
import { ContentEditor } from "@/components/admin/content-editor";
import { PageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";

export default async function ThemePage() {
  await requireAdmin();
  const raw = await readRawContent();
  return (
    <div className="min-h-[100dvh] bg-panel">
      <PageHeader title="Theme & colors" description="Pick a preset or fine-tune every color, the font and corner radius. Publish to go live." />
      <ContentEditor initial={raw} only="theme" />
    </div>
  );
}
