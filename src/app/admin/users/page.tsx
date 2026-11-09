import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, superagents, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteUserAction, setUserPlanAction, setUserRoleAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/input";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PLANS = ["free", "starter", "builder", "pro"];

export default async function UsersPage() {
  const admin = await requireAdmin();
  const [list, pc, ac] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select({ userId: projects.userId, n: count() }).from(projects).groupBy(projects.userId),
    db.select({ userId: superagents.userId, n: count() }).from(superagents).groupBy(superagents.userId),
  ]);
  const pMap = new Map(pc.map((x) => [x.userId, x.n]));
  const aMap = new Map(ac.map((x) => [x.userId, x.n]));

  return (
    <div className="min-h-[100dvh] bg-page">
      <PageHeader title="Users" description={`${list.length} accounts · manage roles, plans and access.`} />
      <div className="mx-auto max-w-[1160px] px-4 py-6 md:px-10 md:py-8">
        <div className="grid gap-3">
          {list.map((u) => {
            const self = u.id === admin.id;
            return (
              <div key={u.id} className="rounded-card border border-line bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-panel text-[13px] font-semibold uppercase">{u.name.slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-semibold">{u.name}</span>
                      <Badge tone={u.role === "admin" ? "dark" : "default"}>{u.role}</Badge>
                      {self && <Badge tone="accent">you</Badge>}
                    </div>
                    <div className="truncate text-[12.5px] text-fg-3">{u.email} · joined {timeAgo(u.createdAt)} · {pMap.get(u.id) ?? 0} apps · {aMap.get(u.id) ?? 0} agents</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <div className="flex rounded-full border border-line bg-panel p-0.5">
                    {PLANS.map((p) => (
                      <form key={p} action={setUserPlanAction.bind(null, u.id, p)}>
                        <button className={`h-7 rounded-full px-2.5 text-[12px] font-medium capitalize transition ${u.plan === p ? "bg-card text-fg shadow-sm" : "text-fg-3 hover:text-fg"}`}>{p}</button>
                      </form>
                    ))}
                  </div>
                  {!self && (
                    <>
                      <form action={setUserRoleAction.bind(null, u.id, u.role === "admin" ? "user" : "admin")}>
                        <Button size="sm" variant="secondary" className="rounded-full">{u.role === "admin" ? "Remove admin" : "Make admin"}</Button>
                      </form>
                      <form action={deleteUserAction.bind(null, u.id)} className="ml-auto">
                        <Button size="sm" variant="danger" className="rounded-full">Delete</Button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
