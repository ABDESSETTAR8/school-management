import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getGuardians, getLinkableStudents } from "@/features/guardians/queries";
import { GuardiansList } from "@/features/guardians/components/guardians-list";

export const metadata: Metadata = { title: "Parents" };

export default async function GuardiansPage() {
  await requireRole(["admin"]);
  const [guardians, students] = await Promise.all([getGuardians(), getLinkableStudents()]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Parents &amp; guardians</h1>
        <p className="text-sm text-muted-foreground">
          Create parent accounts and link them to their children.
        </p>
      </div>
      <GuardiansList guardians={guardians} students={students} />
    </div>
  );
}
