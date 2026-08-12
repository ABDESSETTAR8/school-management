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
  students: { count: number }[];
};

/** All classes with student count and homeroom teacher. */
export async function getClasses(): Promise<ClassListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      `id, name, grade_level, capacity,
       academic_year:academic_years ( name ),
       homeroom:staff ( profile:profiles ( first_name, last_name ) ),
       students ( count )`,
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
    enrolledCount: c.students?.[0]?.count ?? 0,
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
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("class_id", id);

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

type RawStudentRow = {
  id: string;
  first_name: string;
  last_name: string;
  parent_name: string | null;
  parent_phone: string | null;
  status: EnrolledStudent["status"];
  registration_date: string;
};

/** Students assigned to a class. */
export async function getEnrolledStudents(classId: string): Promise<EnrolledStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, first_name, last_name, parent_name, parent_phone, status, registration_date")
    .eq("class_id", classId)
    .order("first_name")
    .returns<RawStudentRow[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((s) => ({
    studentId: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    parent_name: s.parent_name,
    parent_phone: s.parent_phone,
    status: s.status,
    registration_date: s.registration_date,
  }));
}

/** Students with no class assigned. */
export async function getEnrollableStudents(): Promise<EnrollableStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .is("class_id", null)
    .order("first_name")
    .returns<{ id: string; first_name: string; last_name: string }[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({ id: s.id, first_name: s.first_name, last_name: s.last_name }));
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
    .filter((s) => s.profile && ["teacher", "admin", "worker"].includes(s.profile.role))
    .map((s) => ({ id: s.id, name: `${s.profile!.first_name} ${s.profile!.last_name}` }));
}
