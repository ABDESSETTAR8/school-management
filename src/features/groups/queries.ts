import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { GroupListItem } from "@/types/database.types";

type RawGroup = {
  id: string;
  name: string;
  classroom: string | null;
  schedule: string | null;
  capacity: number;
  monthly_fee: number;
  is_active: boolean;
  class: { name: string } | null;
  teacher: { profile: { first_name: string; last_name: string } | null } | null;
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
       teacher:staff ( profile:profiles ( first_name, last_name ) ),
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
      teacherName: g.teacher?.profile
        ? `${g.teacher.profile.first_name} ${g.teacher.profile.last_name}`
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
