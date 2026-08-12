import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceRow, AttendanceStatus } from "@/types/database.types";

export type AttendanceGroupOption = { id: string; name: string; className: string | null };

export type AttendanceSummaryItem = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
};

/** Active groups, for the attendance group selector. */
export async function getAttendanceGroups(): Promise<AttendanceGroupOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select(`id, name, class:classes ( name )`)
    .eq("is_active", true)
    .order("name")
    .returns<{ id: string; name: string; class: { name: string } | null }[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map((g) => ({ id: g.id, name: g.name, className: g.class?.name ?? null }));
}

/** Roster of a group merged with the saved statuses for a given date. */
export async function getGroupAttendanceSheet(
  groupId: string,
  date: string,
): Promise<{ rows: AttendanceRow[] }> {
  const supabase = await createClient();

  const { data: studs } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .eq("group_id", groupId)
    .returns<{ id: string; first_name: string; last_name: string }[]>();

  const { data: recs } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("group_id", groupId)
    .eq("date", date)
    .returns<{ student_id: string; status: AttendanceStatus }[]>();

  const map = new Map<string, AttendanceStatus>();
  for (const r of recs ?? []) map.set(r.student_id, r.status);

  const rows: AttendanceRow[] = (studs ?? [])
    .map((s) => ({
      studentId: s.id,
      name: `${s.first_name} ${s.last_name}`,
      status: map.get(s.id) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { rows };
}

/** Aggregate attendance for a group over a month (YYYY-MM). */
export async function getGroupMonthSummary(
  groupId: string,
  month: string,
): Promise<AttendanceSummaryItem> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("status")
    .eq("group_id", groupId)
    .gte("date", `${month}-01`)
    .lte("date", `${month}-31`)
    .returns<{ status: AttendanceStatus }[]>();

  const c = { present: 0, absent: 0, late: 0, excused: 0 };
  for (const r of data ?? []) c[r.status]++;
  const total = (data ?? []).length;
  const rate = total ? Math.round(((c.present + c.late) / total) * 100) : 0;
  return { ...c, total, rate };
}
