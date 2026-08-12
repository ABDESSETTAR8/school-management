import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { IconName } from "@/lib/icons";

export type DashboardStat = {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
};

export type BarDatum = { label: string; value: number };

export type DashboardOverview = {
  stats: DashboardStat[];
  revenueByGroup: BarDatum[];
  attendance: { present: number; late: number; absent: number; excused: number; total: number };
  monthlyRevenue: number;
  recentStudents: { name: string; date: string; className: string | null }[];
};

async function headCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  filter?: (q: any) => any,
): Promise<number> {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

/** Everything the admin/worker dashboard needs, in one place. */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const [studentCount, teacherCount, groupCount, workerCount] = await Promise.all([
    headCount(supabase, "students"),
    headCount(supabase, "teachers"),
    headCount(supabase, "groups"),
    headCount(supabase, "profiles", (q) => q.eq("role", "worker").eq("is_active", true)),
  ]);

  // Groups → revenue (students × fee)
  const { data: groups } = await supabase
    .from("groups")
    .select(`name, monthly_fee, students ( count )`)
    .returns<{ name: string; monthly_fee: number; students: { count: number }[] }[]>();

  const revenueByGroup = (groups ?? [])
    .map((g) => ({
      label: g.name,
      value: (g.students?.[0]?.count ?? 0) * (Number(g.monthly_fee) || 0),
    }))
    .sort((a, b) => b.value - a.value);
  const monthlyRevenue = revenueByGroup.reduce((s, g) => s + g.value, 0);

  // Teachers → pending payments (salary vs paid this month)
  const { data: teachers } = await supabase
    .from("teachers")
    .select(`salary, is_active, teacher_payments ( amount, payment_date )`)
    .returns<
      { salary: number; is_active: boolean; teacher_payments: { amount: number; payment_date: string }[] }[]
    >();
  let pendingCount = 0;
  for (const t of teachers ?? []) {
    if (!t.is_active) continue;
    const paid = (t.teacher_payments ?? [])
      .filter((p) => p.payment_date.slice(0, 7) === month)
      .reduce((s, p) => s + Number(p.amount), 0);
    if (Number(t.salary) - paid > 0) pendingCount++;
  }

  // Attendance this month + today
  const { data: monthRecs } = await supabase
    .from("attendance")
    .select("status, date")
    .gte("date", `${month}-01`)
    .lte("date", `${month}-31`)
    .returns<{ status: "present" | "late" | "absent" | "excused"; date: string }[]>();

  const attendance = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
  let todayTotal = 0;
  let todayGood = 0;
  for (const r of monthRecs ?? []) {
    attendance[r.status]++;
    attendance.total++;
    if (r.date === today) {
      todayTotal++;
      if (r.status === "present" || r.status === "late") todayGood++;
    }
  }
  const todayRate = todayTotal ? `${Math.round((todayGood / todayTotal) * 100)}%` : "—";

  // Recent students
  const { data: recent } = await supabase
    .from("students")
    .select(`first_name, last_name, registration_date, class:classes ( name )`)
    .order("registration_date", { ascending: false })
    .limit(5)
    .returns<
      { first_name: string; last_name: string; registration_date: string; class: { name: string } | null }[]
    >();
  const recentStudents = (recent ?? []).map((s) => ({
    name: `${s.first_name} ${s.last_name}`,
    date: s.registration_date,
    className: s.class?.name ?? null,
  }));

  const stats: DashboardStat[] = [
    { label: "Students", value: studentCount, icon: "GraduationCap" },
    { label: "Teachers", value: teacherCount, icon: "Presentation" },
    { label: "Groups", value: groupCount, icon: "Layers" },
    { label: "Active Workers", value: workerCount, icon: "UserCog" },
    { label: "Monthly Revenue", value: `${monthlyRevenue.toLocaleString()} DZD`, icon: "Wallet" },
    { label: "Attendance Today", value: todayRate, icon: "CalendarCheck" },
    { label: "Pending Payments", value: pendingCount, icon: "Clock", hint: "teachers unpaid this month" },
  ];

  return { stats, revenueByGroup: revenueByGroup.slice(0, 6), attendance, monthlyRevenue, recentStudents };
}
