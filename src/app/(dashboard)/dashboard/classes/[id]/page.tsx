import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import {
  getClass,
  getEnrollableStudents,
  getEnrolledStudents,
} from "@/features/classes/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollDialog } from "@/features/enrollments/components/enroll-dialog";
import { RosterTable } from "@/features/enrollments/components/roster-table";

export const metadata: Metadata = { title: "Class" };

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("classes");
  const { id } = await params;

  const cls = await getClass(id);
  if (!cls) notFound();

  const [roster, candidates] = await Promise.all([
    getEnrolledStudents(id),
    getEnrollableStudents(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/classes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to classes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{cls.name}</h1>
            <Badge variant="secondary">
              {cls.enrolledCount} student{cls.enrolledCount === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
        <EnrollDialog classId={cls.id} candidates={candidates} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <RosterTable students={roster} classId={cls.id} />
        </CardContent>
      </Card>
    </div>
  );
}
