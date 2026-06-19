import { GraduationCap } from "lucide-react";
import type { ChildAttendance } from "../queries";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive" | "default"> = {
  present: "success",
  late: "warning",
  absent: "destructive",
  excused: "default",
};

export function ParentAttendance({ children }: { children: ChildAttendance[] }) {
  if (children.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
        <GraduationCap className="size-8 opacity-40" />
        <p className="text-sm">No children are linked to your account yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {children.map((c) => (
        <Card key={c.studentId}>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {getInitials(c.name.split(" ")[0], c.name.split(" ")[1])}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{c.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{c.admission_no}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">{c.summary.rate}%</p>
              <p className="text-xs text-muted-foreground">attendance</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="text-success">{c.summary.present} present</span>
              <span className="text-warning-foreground">{c.summary.late} late</span>
              <span className="text-destructive">{c.summary.absent} absent</span>
              <span>{c.summary.excused} excused</span>
            </div>
            <div className="space-y-1.5">
              {c.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
              ) : (
                c.recent.map((r, i) => (
                  <div
                    key={`${r.date}-${i}`}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
                  >
                    <span>{new Date(r.date).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">{r.subject}</span>
                    <Badge variant={STATUS_BADGE[r.status]} className="capitalize">
                      {r.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
