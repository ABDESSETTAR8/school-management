import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getGroups } from "@/features/groups/queries";
import { getClasses } from "@/features/classes/queries";
import { getTeacherOptions } from "@/features/teachers/queries";
import { GroupsGrid } from "@/features/groups/components/groups-grid";

export const metadata: Metadata = { title: "Groups" };

export default async function GroupsPage() {
  await requireRole(["admin", "worker"]);
  const [groups, classList, teachers] = await Promise.all([
    getGroups(),
    getClasses(),
    getTeacherOptions(),
  ]);
  const classes = classList.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Groups</h1>
        <p className="text-sm text-muted-foreground">
          Manage groups, schedules, fees, and monthly revenue.
        </p>
      </div>
      <GroupsGrid groups={groups} classes={classes} teachers={teachers} />
    </div>
  );
}
