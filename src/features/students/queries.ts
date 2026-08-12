import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StudentListItem } from "@/types/database.types";

type RawStudent = {
  id: string;
  first_name: string;
  last_name: string;
  gender: StudentListItem["gender"];
  date_of_birth: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  notes: string | null;
  status: StudentListItem["status"];
  registration_date: string;
  class_id: string | null;
  group_id: string | null;
  class: { name: string } | null;
  group: { name: string } | null;
};

/** All students with their class & group names. Staff only via RLS. */
export async function getStudents(): Promise<StudentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      `id, first_name, last_name, gender, date_of_birth,
       parent_name, parent_phone, address, notes, status, registration_date,
       class_id, group_id,
       class:classes ( name ),
       group:groups ( name )`,
    )
    .order("first_name", { ascending: true })
    .returns<RawStudent[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((s) => ({
    id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    gender: s.gender,
    date_of_birth: s.date_of_birth,
    class_id: s.class_id,
    group_id: s.group_id,
    className: s.class?.name ?? null,
    groupName: s.group?.name ?? null,
    parent_name: s.parent_name,
    parent_phone: s.parent_phone,
    address: s.address,
    notes: s.notes,
    status: s.status,
    registration_date: s.registration_date,
  }));
}

export async function getStudentCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}
