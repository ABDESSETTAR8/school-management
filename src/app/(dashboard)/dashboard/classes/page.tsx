import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { getClasses, getTeacherOptions } from "@/features/classes/queries";
import { ClassesGrid } from "@/features/classes/components/classes-grid";

export const metadata: Metadata = { title: "Classes" };

export default async function ClassesPage() {
  await requirePermission("classes");
  const [classes, teachers] = await Promise.all([getClasses(), getTeacherOptions()]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Classes</h1>
        <p className="text-sm text-muted-foreground">
          Manage class sections and their students.
        </p>
      </div>
      <ClassesGrid classes={classes} teachers={teachers} />
    </div>
  );
}
