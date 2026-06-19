"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveAttendance, type AttendanceEntry } from "../actions";
import type { AttendanceRow, AttendanceStatus } from "@/types/database.types";
import { getInitials, cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

const STATUSES: { value: AttendanceStatus; label: string; on: string }[] = [
  { value: "present", label: "Present", on: "bg-success text-success-foreground border-success" },
  { value: "late", label: "Late", on: "bg-warning text-warning-foreground border-warning" },
  { value: "excused", label: "Excused", on: "bg-primary text-primary-foreground border-primary" },
  { value: "absent", label: "Absent", on: "bg-destructive text-destructive-foreground border-destructive" },
];

export function AttendanceSheet({
  classSubjectId,
  date,
  rows,
}: {
  classSubjectId: string;
  date: string;
  rows: AttendanceRow[];
}) {
  const initial = useMemo(() => {
    const m: Record<string, AttendanceStatus> = {};
    for (const r of rows) m[r.studentId] = r.status ?? "present";
    return m;
  }, [rows]);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(initial);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function setStatus(id: string, s: AttendanceStatus) {
    setStatuses((p) => ({ ...p, [id]: s }));
    setSaved(false);
  }

  function markAll(s: AttendanceStatus) {
    const m: Record<string, AttendanceStatus> = {};
    for (const r of rows) m[r.studentId] = s;
    setStatuses(m);
    setSaved(false);
  }

  function onSave() {
    setError(null);
    const entries: AttendanceEntry[] = rows.map((r) => ({
      studentId: r.studentId,
      status: statuses[r.studentId] ?? "present",
    }));
    startTransition(async () => {
      const res = await saveAttendance(classSubjectId, date, entries);
      if (res?.error) {
        setError(res.error);
        toast({ title: res.error, variant: "error" });
      } else {
        setSaved(true);
        toast({ title: res?.success ?? "Attendance saved.", variant: "success" });
      }
    });
  }

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, excused: 0, absent: 0 };
    for (const r of rows) c[statuses[r.studentId] ?? "present"]++;
    return c;
  }, [statuses, rows]);

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No students enrolled in this class.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => markAll("present")}>
          Mark all present
        </Button>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="text-success">{counts.present} present</span>
          <span className="text-warning-foreground">· {counts.late} late</span>
          <span className="text-primary">· {counts.excused} excused</span>
          <span className="text-destructive">· {counts.absent} absent</span>
        </div>
      </div>

      <div className="divide-y divide-border rounded-xl border border-border">
        {rows.map((r) => (
          <div key={r.studentId} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="size-9">
              <AvatarFallback>
                {getInitials(r.name.split(" ")[0], r.name.split(" ")[1])}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.name}</p>
              <p className="truncate text-xs text-muted-foreground">{r.admission_no}</p>
            </div>
            <div className="flex gap-1">
              {STATUSES.map((s) => {
                const active = (statuses[r.studentId] ?? "present") === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(r.studentId, s.value)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      active ? s.on : "border-input text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Save attendance
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="size-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}
