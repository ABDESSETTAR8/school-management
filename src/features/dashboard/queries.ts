import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { IconName } from "@/lib/icons";

export type DashboardStat = {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
};

async function countOf(table: "students" | "staff" | "classes"): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
  return count ?? 0;
}

async function attendanceTodayRate(): Promise<string> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { count: total } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("date", today);

  if (!total) return "—";

  const { count: present } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("date", today)
    .in("status", ["present", "late"]);

  return `${Math.round(((present ?? 0) / total) * 100)}%`;
}

/** Live figures for the admin overview. */
export async function getAdminStats(): Promise<DashboardStat[]> {
  const [students, staff, classes, attendance] = await Promise.all([
    countOf("students"),
    countOf("staff"),
    countOf("classes"),
    attendanceTodayRate(),
  ]);

  return [
    { label: "Total Students", value: students, icon: "GraduationCap" },
    { label: "Staff", value: staff, icon: "UserCog", hint: "Teachers & workers" },
    { label: "Active Classes", value: classes, icon: "Users" },
    { label: "Attendance Today", value: attendance, icon: "CalendarCheck", hint: "School-wide" },
  ];
}
