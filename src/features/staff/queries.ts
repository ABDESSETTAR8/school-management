import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StaffListItem } from "@/types/database.types";

type RawStaff = {
  id: string;
  employee_no: string;
  job_title: string | null;
  department: string | null;
  hire_date: string;
  profile: StaffListItem["profile"] | null;
};

/** All staff with their profile. Admin only via RLS. */
export async function getStaff(): Promise<StaffListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select(
      `id, employee_no, job_title, department, hire_date,
       profile:profiles ( id, first_name, last_name, email, phone, role, is_active )`,
    )
    .order("employee_no", { ascending: true })
    .returns<RawStaff[]>();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((s) => s.profile)
    .map((s) => ({
      id: s.id,
      employee_no: s.employee_no,
      job_title: s.job_title,
      department: s.department,
      hire_date: s.hire_date,
      profile: s.profile!,
    }));
}
