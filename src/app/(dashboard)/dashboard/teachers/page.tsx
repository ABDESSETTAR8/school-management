import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getTeachers } from "@/features/teachers/queries";
import { TeachersTable } from "@/features/teachers/components/teachers-table";

export const metadata: Metadata = { title: "Teachers" };

export default async function TeachersPage() {
  await requireRole(["admin", "worker"]);
  const teachers = await getTeachers();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Teachers</h1>
        <p className="text-sm text-muted-foreground">
          Manage teachers, salaries, and payments.
        </p>
      </div>
      <TeachersTable teachers={teachers} />
    </div>
  );
}
