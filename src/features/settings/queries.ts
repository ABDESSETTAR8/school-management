import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AcademicYearWithTerms } from "@/types/database.types";

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
