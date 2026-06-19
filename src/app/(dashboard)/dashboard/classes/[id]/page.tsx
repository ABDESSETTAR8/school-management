import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
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
  await requireRole(["admin"]);
  const { id } = await params;

  const cls = await getClass(id);
  if (!cls) notFound();

  const [roster, candidates] = await Promise.all([
    getEnrolledStudents(id),
    getEnrollableStudents(),
  ]);

  const full = cls.enrolledCount >= cls.capacity;

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
            <Badge variant={full ? "warning" : "secondary"}>
              {cls.enrolledCount}/{cls.capacity}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Grade {cls.grade_level} · {cls.academicYear} · Homeroom: {cls.homeroomTeacher ?? "Unassigned"}
          </p>
        </div>
        <EnrollDialog classId={cls.id} candidates={candidates} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Enrolled</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{cls.enrolledCount}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Capacity</span>
            <GraduationCap className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{cls.capacity}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Available seats</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{Math.max(0, cls.capacity - cls.enrolledCount)}</p>
        </Card>
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
