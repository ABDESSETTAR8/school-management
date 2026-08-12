import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { getStudents } from "@/features/students/queries";
import { getClasses } from "@/features/classes/queries";
import { getGroups } from "@/features/groups/queries";
import { StudentsTable } from "@/features/students/components/students-table";

export const metadata: Metadata = { title: "Students" };

const PAGE_SIZE = 10;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePermission("students");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ rows, total }, classList, groupList] = await Promise.all([
    getStudents({ q, page, pageSize: PAGE_SIZE }),
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
      <StudentsTable
        students={rows}
        classes={classes}
        groups={groups}
        q={q}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
