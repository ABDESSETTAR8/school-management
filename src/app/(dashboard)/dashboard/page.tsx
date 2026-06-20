import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/config/navigation";
import type { IconName } from "@/lib/icons";
import type { UserRole } from "@/types/database.types";
import { getAdminStats } from "@/features/dashboard/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Overview" };

type Stat = { label: string; value: string | number; icon: IconName; hint?: string };

// Placeholder figures for non-admin roles — wired to per-user queries in a later phase.
const STATS_BY_ROLE: Record<Exclude<UserRole, "admin">, Stat[]> = {
  teacher: [
    { label: "My Classes", value: 5, icon: "Users" },
    { label: "Students", value: 148, icon: "GraduationCap" },
    { label: "Today's Sessions", value: 3, icon: "CalendarCheck", hint: "1 pending" },
    { label: "Subjects", value: 2, icon: "BookOpen" },
  ],
  student: [
    { label: "My Classes", value: 6, icon: "Users" },
    { label: "Attendance", value: "97%", icon: "CalendarCheck", hint: "This term" },
    { label: "Subjects", value: 8, icon: "BookOpen" },
  ],
  parent: [
    { label: "Children", value: 2, icon: "GraduationCap" },
    { label: "Avg. Attendance", value: "95%", icon: "CalendarCheck", hint: "This term" },
  ],
  worker: [
    { label: "Open Tasks", value: 7, icon: "ClipboardList" },
    { label: "Completed", value: 23, icon: "CalendarCheck", hint: "This week" },
  ],
};

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const stats =
    profile.role === "admin" || profile.role === "worker"
      ? await getAdminStats()
      : STATS_BY_ROLE[profile.role];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile.first_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ROLE_LABELS[profile.role]} dashboard · here&apos;s your snapshot for today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} index={i} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Activity feed wires up in the next phase.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Role-specific shortcuts.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
