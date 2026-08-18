import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  BillingStatus,
  GroupDetail,
  GroupListItem,
  GroupStudentRow,
} from "@/types/database.types";

/** A single group with its students, each with this-month attendance + payment status. */
export async function getGroupDetail(
  id: string,
): Promise<{ group: GroupDetail; students: GroupStudentRow[] } | null> {
  const supabase = await createClient();
  const month = new Date().toISOString().slice(0, 7);

  const { data: g } = await supabase
    .from("groups")
    .select(
      `id, name, schedule, classroom, monthly_fee, capacity, is_active,
       class:classes ( name ),
       teacher:teachers ( first_name, last_name )`,
    )
    .eq("id", id)
    .maybeSingle<{
      id: string;
      name: string;
      schedule: string | null;
      classroom: string | null;
      monthly_fee: number;
      capacity: number;
      is_active: boolean;
      class: { name: string } | null;
      teacher: { first_name: string; last_name: string } | null;
    }>();
  if (!g) return null;

  const monthlyFee = Number(g.monthly_fee) || 0;

  const { data: studs } = await supabase
    .from("students")
    .select("id, first_name, last_name, parent_phone")
    .eq("group_id", id)
    .order("first_name")
    .returns<{ id: string; first_name: string; last_name: string; parent_phone: string | null }[]>();
  const students = studs ?? [];
  const ids = students.map((s) => s.id);

  const [{ data: att }, { data: pays }] = await Promise.all([
    supabase
      .from("attendance")
      .select("student_id, status")
      .eq("group_id", id)
      .gte("date", `${month}-01`)
      .lte("date", `${month}-31`)
      .returns<{ student_id: string; status: string }[]>(),
    ids.length
      ? supabase
          .from("student_payments")
          .select("student_id, amount")
          .eq("for_month", month)
          .in("student_id", ids)
          .returns<{ student_id: string; amount: number }[]>()
      : Promise.resolve({ data: [] as { student_id: string; amount: number }[] }),
  ]);

  const rows: GroupStudentRow[] = students.map((s) => {
    const mine = (att ?? []).filter((a) => a.student_id === s.id);
    const present = mine.filter((a) => a.status === "present" || a.status === "late").length;
    const total = mine.length;
    const paidThisMonth = (pays ?? [])
      .filter((p) => p.student_id === s.id)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    let paidStatus: BillingStatus = "unpaid";
    if (monthlyFee > 0 && paidThisMonth >= monthlyFee) paidStatus = "paid";
    else if (paidThisMonth > 0) paidStatus = "partial";
    return {
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      phone: s.parent_phone,
      attendanceRate: total ? Math.round((present / total) * 100) : 0,
      presentCount: present,
      absentCount: total - present,
      paidThisMonth,
      monthlyFee,
      paidStatus,
    };
  });

  return {
    group: {
      id: g.id,
      name: g.name,
      className: g.class?.name ?? null,
      teacherName: g.teacher ? `${g.teacher.first_name} ${g.teacher.last_name}` : null,
      schedule: g.schedule,
      classroom: g.classroom,
      monthlyFee,
      capacity: g.capacity,
      isActive: g.is_active,
    },
    students: rows,
  };
}

type RawGroup = {
  id: string;
  name: string;
  classroom: string | null;
  schedule: string | null;
  capacity: number;
  monthly_fee: number;
  is_active: boolean;
  class: { name: string } | null;
  teacher: { first_name: string; last_name: string } | null;
  students: { count: number }[];
};

/** All groups with computed student count and monthly revenue. */
export async function getGroups(): Promise<GroupListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select(
      `id, name, classroom, schedule, capacity, monthly_fee, is_active,
       class:classes ( name ),
       teacher:teachers ( first_name, last_name ),
       students ( count )`,
    )
    .order("name", { ascending: true })
    .returns<RawGroup[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((g) => {
    const studentsCount = g.students?.[0]?.count ?? 0;
    const fee = Number(g.monthly_fee) || 0;
    return {
      id: g.id,
      name: g.name,
      className: g.class?.name ?? null,
      teacherName: g.teacher
        ? `${g.teacher.first_name} ${g.teacher.last_name}`
        : null,
      classroom: g.classroom,
      schedule: g.schedule,
      capacity: g.capacity,
      monthlyFee: fee,
      studentsCount,
      revenue: studentsCount * fee,
      isActive: g.is_active,
    };
  });
}
