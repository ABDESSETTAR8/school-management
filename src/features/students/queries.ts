import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StudentListItem } from "@/types/database.types";

type RawStudent = {
  id: string;
  admission_no: string;
  admission_date: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    gender: StudentListItem["profile"]["gender"];
    is_active: boolean;
  } | null;
  enrollments: {
    status: string;
    class: { id: string; name: string; grade_level: number } | null;
  }[];
};

/** All students with their profile and current (active) class. Admin/staff only via RLS. */
export async function getStudents(): Promise<StudentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      `id, admission_no, admission_date,
       profile:profiles ( id, first_name, last_name, email, phone, gender, is_active ),
       enrollments ( status, class:classes ( id, name, grade_level ) )`,
    )
    .order("admission_no", { ascending: true })
    .returns<RawStudent[]>();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((s) => s.profile)
    .map((s) => {
      const active = s.enrollments?.find((e) => e.status === "active");
      return {
        id: s.id,
        admission_no: s.admission_no,
        admission_date: s.admission_date,
        profile: s.profile!,
        currentClass: active?.class ?? null,
      };
    });
}

export async function getStudentCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}
