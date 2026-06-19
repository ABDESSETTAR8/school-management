import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Subject } from "@/types/database.types";

type SubjectWithCount = Subject & { classCount: number };

/** All subjects with the number of class offerings using them. */
export async function getSubjects(): Promise<SubjectWithCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select(`id, code, name, description, class_subjects ( id )`)
    .order("name", { ascending: true })
    .returns<(Subject & { class_subjects: { id: string }[] })[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    description: s.description,
    classCount: s.class_subjects?.length ?? 0,
  }));
}
