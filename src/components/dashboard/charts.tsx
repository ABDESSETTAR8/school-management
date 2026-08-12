import { cn } from "@/lib/utils";
import type { BarDatum } from "@/features/dashboard/queries";

/** Simple horizontal bar chart — no charting dependency. */
export function BarChart({ data, unit = "" }: { data: BarDatum[]; unit?: string }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-medium">{d.label}</span>
            <span className="text-muted-foreground">
              {d.value.toLocaleString()}
              {unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const SEGMENTS = [
  { key: "present", label: "Present", color: "bg-success", text: "text-success" },
  { key: "late", label: "Late", color: "bg-warning", text: "text-warning-foreground" },
  { key: "excused", label: "Excused", color: "bg-primary", text: "text-primary" },
  { key: "absent", label: "Absent", color: "bg-destructive", text: "text-destructive" },
] as const;

/** Segmented bar showing attendance status proportions this month. */
export function AttendanceBreakdown({
  data,
}: {
  data: { present: number; late: number; absent: number; excused: number; total: number };
}) {
  const total = data.total || 0;
  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No attendance recorded yet.</p>;
  }
  return (
    <div className="space-y-4">
      <div className="flex h-3 overflow-hidden rounded-full">
        {SEGMENTS.map((s) => {
          const v = data[s.key];
          if (!v) return null;
          return <div key={s.key} className={s.color} style={{ width: `${(v / total) * 100}%` }} />;
        })}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SEGMENTS.map((s) => (
          <div key={s.key}>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", s.color)} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="mt-0.5 text-lg font-semibold">
              {total ? Math.round((data[s.key] / total) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">{data[s.key]} records</p>
          </div>
        ))}
      </div>
    </div>
  );
}
