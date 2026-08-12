import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import {
  getAttendanceGroups,
  getGroupAttendanceSheet,
  getGroupMonthSummary,
} from "@/features/attendance/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceControls } from "@/features/attendance/components/attendance-controls";
import { AttendanceSheet } from "@/features/attendance/components/attendance-sheet";

export const metadata: Metadata = { title: "Attendance" };

function Empty({ text }: { text: string }) {
  return (
    <Card className="flex items-center justify-center py-16 text-center text-sm text-muted-foreground">
      {text}
    </Card>
  );
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ grp?: string; date?: string }>;
}) {
  await requirePermission("attendance");
  const sp = await searchParams;
  const today = new Date().toISOString().slice(0, 10);

  const groups = await getAttendanceGroups();

  if (groups.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <Empty text="No active groups yet. Create a group first, then assign students to it." />
      </div>
    );
  }

  const selectedId = sp.grp && groups.some((g) => g.id === sp.grp) ? sp.grp : groups[0].id;
  const date = sp.date ?? today;
  const [{ rows }, summary] = await Promise.all([
    getGroupAttendanceSheet(selectedId, date),
    getGroupMonthSummary(selectedId, date.slice(0, 7)),
  ]);
  const selected = groups.find((g) => g.id === selectedId)!;

  const stats = [
    { label: "This month rate", value: `${summary.rate}%` },
    { label: "Present", value: summary.present },
    { label: "Absent", value: summary.absent },
    { label: "Late", value: summary.late },
  ];

  return (
    <div className="space-y-6">
      <Header />
      <AttendanceControls groups={groups} selectedId={selectedId} date={date} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selected.name}
            {selected.className ? ` · ${selected.className}` : ""} ·{" "}
            <span className="font-normal text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceSheet groupId={selectedId} date={date} rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}

function Header() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
      <p className="text-sm text-muted-foreground">
        Select a group and date, then mark each student.
      </p>
    </div>
  );
}
