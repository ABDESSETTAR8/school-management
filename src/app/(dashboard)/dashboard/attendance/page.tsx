import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import {
  getAttendanceSheet,
  getMyStaffId,
  getOfferings,
  getParentChildrenAttendance,
  getStudentAttendance,
} from "@/features/attendance/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceControls } from "@/features/attendance/components/attendance-controls";
import { AttendanceSheet } from "@/features/attendance/components/attendance-sheet";
import { StudentAttendance } from "@/features/attendance/components/student-attendance";
import { ParentAttendance } from "@/features/attendance/components/parent-attendance";

export const metadata: Metadata = { title: "Attendance" };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ cs?: string; date?: string }>;
}) {
  const { profile } = await requireUser();
  const sp = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

  // ---- Student view --------------------------------------------------------
  if (profile.role === "student") {
    const data = await getStudentAttendance();
    return (
      <div className="space-y-6">
        <Header title="My attendance" subtitle="Your attendance summary and history." />
        {data ? (
          <StudentAttendance summary={data.summary} history={data.history} />
        ) : (
          <Empty text="No student record linked to your account." />
        )}
      </div>
    );
  }

  // ---- Parent view ---------------------------------------------------------
  if (profile.role === "parent") {
    const childrenAttendance = await getParentChildrenAttendance();
    return (
      <div className="space-y-6">
        <Header title="Children's attendance" subtitle="Attendance for your linked children." />
        <ParentAttendance children={childrenAttendance} />
      </div>
    );
  }

  // ---- Worker (no attendance surface) --------------------------------------
  if (profile.role === "worker") {
    return (
      <div className="space-y-6">
        <Header title="Attendance" subtitle="" />
        <Empty text="Attendance is managed by teaching staff." />
      </div>
    );
  }

  // ---- Admin / Teacher: take attendance ------------------------------------
  const staffId = await getMyStaffId();
  const offerings = await getOfferings(profile.role, staffId);

  if (offerings.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="Take attendance" subtitle="" />
        <Empty
          text={
            profile.role === "teacher"
              ? "You have no assigned classes yet."
              : "No class-subject offerings found. Run the demo seeder or assign subjects to classes."
          }
        />
      </div>
    );
  }

  const selectedId = sp.cs && offerings.some((o) => o.id === sp.cs) ? sp.cs : offerings[0].id;
  const date = sp.date ?? today;
  const { rows } = await getAttendanceSheet(selectedId, date);
  const selected = offerings.find((o) => o.id === selectedId)!;

  return (
    <div className="space-y-6">
      <Header
        title="Take attendance"
        subtitle="Select a class, subject, and date, then mark each student."
      />
      <AttendanceControls offerings={offerings} selectedId={selectedId} date={date} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selected.className} · {selected.subjectName} ·{" "}
            <span className="font-normal text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceSheet classSubjectId={selectedId} date={date} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card className="flex items-center justify-center py-16 text-center text-sm text-muted-foreground">
      {text}
    </Card>
  );
}
