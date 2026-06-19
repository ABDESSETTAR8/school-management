import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { GuardianListItem, LinkableStudent } from "@/types/database.types";

type RawGuardian = {
  id: string;
  occupation: string | null;
  profile: GuardianListItem["profile"] | null;
  links: {
    relationship: GuardianListItem["children"][number]["relationship"];
    student: {
      id: string;
      admission_no: string;
      profile: { first_name: string; last_name: string } | null;
    } | null;
  }[];
};

/** All guardian (parent) accounts with their linked children. Admin only via RLS. */
export async function getGuardians(): Promise<GuardianListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guardians")
    .select(
      `id, occupation,
       profile:profiles ( id, first_name, last_name, email, phone, is_active ),
       links:student_guardians (
         relationship,
         student:students ( id, admission_no, profile:profiles ( first_name, last_name ) )
       )`,
    )
    .returns<RawGuardian[]>();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((g) => g.profile)
    .map((g) => ({
      id: g.id,
      occupation: g.occupation,
      profile: g.profile!,
      children: (g.links ?? [])
        .filter((l) => l.student?.profile)
        .map((l) => ({
          linkStudentId: l.student!.id,
          studentId: l.student!.id,
          name: `${l.student!.profile!.first_name} ${l.student!.profile!.last_name}`,
          admission_no: l.student!.admission_no,
          relationship: l.relationship,
        })),
    }))
    .sort((a, b) => a.profile.last_name.localeCompare(b.profile.last_name));
}

/** All students, for the link picker. */
export async function getLinkableStudents(): Promise<LinkableStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(`id, admission_no, profile:profiles ( first_name, last_name )`)
    .returns<
      { id: string; admission_no: string; profile: { first_name: string; last_name: string } | null }[]
    >();

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((s) => s.profile)
    .map((s) => ({
      id: s.id,
      admission_no: s.admission_no,
      name: `${s.profile!.first_name} ${s.profile!.last_name}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
