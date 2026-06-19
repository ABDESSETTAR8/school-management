import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getStudents } from "@/features/students/queries";
import { StudentsTable } from "@/features/students/components/students-table";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage() {
  await requireRole(["admin"]);
  const students = await getStudents();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground">
          Manage student accounts, admissions, and class assignments.
        </p>
      </div>
      <StudentsTable students={students} />
    </div>
  );
}
