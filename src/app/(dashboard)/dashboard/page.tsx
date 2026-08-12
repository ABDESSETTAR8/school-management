import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/config/navigation";
import { getDashboardOverview } from "@/features/dashboard/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart, AttendanceBreakdown } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Overview" };

export default async function DashboardPage() {
  const { profile } = await requireUser();

  // Only admins/workers get the full analytics dashboard.
  if (profile.role !== "admin" && profile.role !== "worker") {
    return (
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile.first_name}
        </h1>
        <p className="text-sm text-muted-foreground">{ROLE_LABELS[profile.role]} dashboard.</p>
      </div>
    );
  }

  const { stats, revenueByGroup, attendance, recentStudents } = await getDashboardOverview();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {profile.first_name}
        </h1>
        <p className="text-sm text-muted-foreground">Here&apos;s your school at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} index={i} {...s} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by group (monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={revenueByGroup} unit=" DZD" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance this month</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceBreakdown data={attendance} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently registered students</CardTitle>
        </CardHeader>
        <CardContent>
          {recentStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No students yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentStudents.map((s, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">
                    {s.className ?? "—"} · {new Date(s.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
