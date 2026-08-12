import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AcademicYearWithTerms, SchoolSettings } from "@/types/database.types";

/** The single school-settings row (creates a sensible default if missing). */
export async function getSchoolSettings(): Promise<SchoolSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_settings")
    .select("id, school_name, email, phone, address, logo_url")
    .maybeSingle<SchoolSettings>();

  return (
    data ?? {
      id: true,
      school_name: "My School",
      email: null,
      phone: null,
      address: null,
      logo_url: null,
    }
  );
}

/** All academic years with their terms, newest first. */
export async function getAcademicYears(): Promise<AcademicYearWithTerms[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("academic_years")
    .select(
      `id, name, start_date, end_date, is_current,
       terms ( id, academic_year_id, name, kind, start_date, end_date )`,
    )
    .order("start_date", { ascending: false })
    .returns<AcademicYearWithTerms[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((y) => ({
    ...y,
    terms: [...(y.terms ?? [])].sort((a, b) => a.start_date.localeCompare(b.start_date)),
  }));
}
