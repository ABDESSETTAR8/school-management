import { CalendarCheck } from "lucide-react";
import type { AttendanceHistoryItem, AttendanceSummary } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive" | "default"> = {
  present: "success",
  late: "warning",
  absent: "destructive",
  excused: "default",
};

export function StudentAttendance({
  summary,
  history,
}: {
  summary: AttendanceSummary;
  history: AttendanceHistoryItem[];
}) {
  const stats = [
    { label: "Attendance rate", value: `${summary.rate}%` },
    { label: "Present", value: summary.present },
    { label: "Late", value: summary.late },
    { label: "Absent", value: summary.absent },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              <CalendarCheck className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance history</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No attendance recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h, i) => (
                  <TableRow key={`${h.date}-${i}`}>
                    <TableCell className="text-sm">
                      {new Date(h.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{h.className}</TableCell>
                    <TableCell className="text-sm">{h.subject}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[h.status]} className="capitalize">
                        {h.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
