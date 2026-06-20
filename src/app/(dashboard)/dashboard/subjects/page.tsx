import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getSubjects } from "@/features/subjects/queries";
import { SubjectsTable } from "@/features/subjects/components/subjects-table";

export const metadata: Metadata = { title: "Subjects" };

export default async function SubjectsPage() {
  await requireRole(["admin", "worker"]);
  const subjects = await getSubjects();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
        <p className="text-sm text-muted-foreground">
          Manage the subject catalog used across classes.
        </p>
      </div>
      <SubjectsTable subjects={subjects} />
    </div>
  );
}
