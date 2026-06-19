import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ClassListItem,
  EnrollableStudent,
  EnrolledStudent,
  TeacherOption,
} from "@/types/database.types";

type RawClass = {
  id: string;
  name: string;
  grade_level: number;
  capacity: number;
  academic_year: { name: string } | null;
  homeroom: { profile: { first_name: string; last_name: string } | null } | null;
  enrollments: { status: string }[];
};

/** All classes with roster size and homeroom teacher. */
export async function getClasses(): Promise<ClassListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      `id, name, grade_level, capacity,
       academic_year:academic_years ( name ),
       homeroom:staff ( profile:profiles ( first_name, last_name ) ),
       enrollments ( status )`,
    )
    .order("grade_level", { ascending: true })
    .order("name", { ascending: true })
    .returns<RawClass[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade_level: c.grade_level,
    capacity: c.capacity,
    enrolledCount: (c.enrollments ?? []).filter((e) => e.status === "active").length,
    homeroomTeacher: c.homeroom?.profile
      ? `${c.homeroom.profile.first_name} ${c.homeroom.profile.last_name}`
      : null,
    academicYear: c.academic_year?.name ?? "—",
  }));
}

type RawClassDetail = {
  id: string;
  name: string;
  grade_level: number;
  capacity: number;
  academic_year: { name: string } | null;
  homeroom: { profile: { first_name: string; last_name: string } | null } | null;
};

export async function getClass(id: string): Promise<ClassListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      `id, name, grade_level, capacity,
       academic_year:academic_years ( name ),
       homeroom:staff ( profile:profiles ( first_name, last_name ) )`,
    )
    .eq("id", id)
    .maybeSingle<RawClassDetail>();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { count } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("class_id", id)
    .eq("status", "active");

  return {
    id: data.id,
    name: data.name,
    grade_level: data.grade_level,
    capacity: data.capacity,
    enrolledCount: count ?? 0,
    homeroomTeacher: data.homeroom?.profile
      ? `${data.homeroom.profile.first_name} ${data.homeroom.profile.last_name}`
      : null,
    academicYear: data.academic_year?.name ?? "—",
  };
}

type RawEnrollment = {
  id: string;
  enrolled_at: string;
  student: {
    id: string;
    admission_no: string;
    profile: { first_name: string; last_name: string; email: string } | null;
  } | null;
};

/** Students actively enrolled in a class. */
export async function getEnrolledStudents(classId: string): Promise<EnrolledStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `id, enrolled_at,
       student:students ( id, admission_no, profile:profiles ( first_name, last_name, email ) )`,
    )
    .eq("class_id", classId)
    .eq("status", "active")
    .returns<RawEnrollment[]>();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((e) => e.student?.profile)
    .map((e) => ({
      enrollmentId: e.id,
      studentId: e.student!.id,
      admission_no: e.student!.admission_no,
      first_name: e.student!.profile!.first_name,
      last_name: e.student!.profile!.last_name,
      email: e.student!.profile!.email,
      enrolled_at: e.enrolled_at,
    }));
}

/** Students with no active enrollment anywhere — available to add to a class. */
export async function getEnrollableStudents(): Promise<EnrollableStudent[]> {
  const supabase = await createClient();

  const { data: active } = await supabase
    .from("enrollments")
    .select("student_id")
    .eq("status", "active");
  const taken = new Set((active ?? []).map((e: { student_id: string }) => e.student_id));

  const { data, error } = await supabase
    .from("students")
    .select(`id, admission_no, profile:profiles ( first_name, last_name, email )`)
    .returns<
      { id: string; admission_no: string; profile: { first_name: string; last_name: string; email: string } | null }[]
    >();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((s) => s.profile && !taken.has(s.id))
    .map((s) => ({
      id: s.id,
      admission_no: s.admission_no,
      first_name: s.profile!.first_name,
      last_name: s.profile!.last_name,
      email: s.profile!.email,
    }));
}

/** Staff who can be homeroom teachers (teachers + admins). */
export async function getTeacherOptions(): Promise<TeacherOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select(`id, profile:profiles!inner ( first_name, last_name, role )`)
    .returns<
      { id: string; profile: { first_name: string; last_name: string; role: string } | null }[]
    >();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((s) => s.profile && ["teacher", "admin"].includes(s.profile.role))
    .map((s) => ({ id: s.id, name: `${s.profile!.first_name} ${s.profile!.last_name}` }));
}
