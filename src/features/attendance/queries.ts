import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AttendanceHistoryItem,
  AttendanceRow,
  AttendanceStatus,
  AttendanceSummary,
  ClassSubjectOption,
  UserRole,
} from "@/types/database.types";

type RawOffering = {
  id: string;
  teacher_id: string | null;
  class: { id: string; name: string; grade_level: number } | null;
  subject: { name: string } | null;
  teacher: { profile: { first_name: string; last_name: string } | null } | null;
};

/** Class-subject offerings selectable for taking attendance.
 *  Admins see all; teachers see only offerings they teach. */
export async function getOfferings(
  role: UserRole,
  staffId: string | null,
): Promise<ClassSubjectOption[]> {
  const supabase = await createClient();
  let q = supabase
    .from("class_subjects")
    .select(
      `id, teacher_id,
       class:classes ( id, name, grade_level ),
       subject:subjects ( name ),
       teacher:staff ( profile:profiles ( first_name, last_name ) )`,
    );
  if (role === "teacher" && staffId) q = q.eq("teacher_id", staffId);

  const { data, error } = await q.returns<RawOffering[]>();
  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((o) => o.class && o.subject)
    .map((o) => ({
      id: o.id,
      classId: o.class!.id,
      className: o.class!.name,
      gradeLevel: o.class!.grade_level,
      subjectName: o.subject!.name,
      teacherName: o.teacher?.profile
        ? `${o.teacher.profile.first_name} ${o.teacher.profile.last_name}`
        : null,
    }))
    .sort((a, b) =>
      a.className === b.className
        ? a.subjectName.localeCompare(b.subjectName)
        : a.className.localeCompare(b.className),
    );
}

/** Roster for a class-subject on a date, merged with any saved statuses. */
export async function getAttendanceSheet(
  classSubjectId: string,
  date: string,
): Promise<{ rows: AttendanceRow[]; sessionExists: boolean }> {
  const supabase = await createClient();

  const { data: cs } = await supabase
    .from("class_subjects")
    .select("class_id")
    .eq("id", classSubjectId)
    .maybeSingle<{ class_id: string }>();
  if (!cs) return { rows: [], sessionExists: false };

  // Students assigned to this class
  const { data: studs } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .eq("class_id", cs.class_id)
    .returns<{ id: string; first_name: string; last_name: string }[]>();

  // Existing session + records for this date
  const { data: session } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("class_subject_id", classSubjectId)
    .eq("session_date", date)
    .maybeSingle<{ id: string }>();

  const statusByStudent = new Map<string, AttendanceStatus>();
  if (session) {
    const { data: recs } = await supabase
      .from("attendance_records")
      .select("student_id, status")
      .eq("session_id", session.id)
      .returns<{ student_id: string; status: AttendanceStatus }[]>();
    for (const r of recs ?? []) statusByStudent.set(r.student_id, r.status);
  }

  const rows: AttendanceRow[] = (studs ?? [])
    .map((s) => ({
      studentId: s.id,
      name: `${s.first_name} ${s.last_name}`,
      status: statusByStudent.get(s.id) ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { rows, sessionExists: Boolean(session) };
}

/** Resolve the staff.id for the current user (null if not staff). */
export async function getMyStaffId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("staff")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle<{ id: string }>();
  return data?.id ?? null;
}

function summarize(statuses: AttendanceStatus[]): AttendanceSummary {
  const c = { present: 0, absent: 0, late: 0, excused: 0 };
  for (const s of statuses) c[s]++;
  const total = statuses.length;
  const rate = total ? Math.round(((c.present + c.late) / total) * 100) : 0;
  return { total, ...c, rate };
}

/** A student's own attendance summary + recent history. */
export async function getStudentAttendance(): Promise<{
  summary: AttendanceSummary;
  history: AttendanceHistoryItem[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle<{ id: string }>();
  if (!student) return null;

  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      `status,
       session:attendance_sessions (
         session_date,
         class_subject:class_subjects (
           subject:subjects ( name ),
           class:classes ( name )
         )
       )`,
    )
    .eq("student_id", student.id)
    .returns<
      {
        status: AttendanceStatus;
        session: {
          session_date: string;
          class_subject: { subject: { name: string } | null; class: { name: string } | null } | null;
        } | null;
      }[]
    >();

  if (error) throw new Error(error.message);

  const history: AttendanceHistoryItem[] = (data ?? [])
    .filter((r) => r.session)
    .map((r) => ({
      date: r.session!.session_date,
      status: r.status,
      subject: r.session!.class_subject?.subject?.name ?? "—",
      className: r.session!.class_subject?.class?.name ?? "—",
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return { summary: summarize(history.map((h) => h.status)), history };
}

export type ChildAttendance = {
  studentId: string;
  name: string;
  admission_no: string;
  summary: AttendanceSummary;
  recent: AttendanceHistoryItem[];
};

/** Deprecated: parents no longer have accounts. Kept as a no-op for compatibility. */
export async function getParentChildrenAttendance(): Promise<ChildAttendance[]> {
  return [];
}
