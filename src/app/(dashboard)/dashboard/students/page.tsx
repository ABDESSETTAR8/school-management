import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getStudents } from "@/features/students/queries";
import { getClasses } from "@/features/classes/queries";
import { getGroups } from "@/features/groups/queries";
import { StudentsTable } from "@/features/students/components/students-table";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  await requireRole(["admin", "worker"]);
  const [students, classList, groupList] = await Promise.all([
    getStudents(),
    getClasses(),
    getGroups(),
  ]);
  const classes = classList.map((c) => ({ id: c.id, name: c.name }));
  const groups = groupList.map((g) => ({ id: g.id, name: g.name }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          Register and manage students, their class, group, and parent contact.
        </p>
      </div>
      <StudentsTable students={students} classes={classes} groups={groups} />
    </div>
  );
}
