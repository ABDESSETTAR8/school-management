import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Subject } from "@/types/database.types";

type SubjectWithCount = Subject & { classCount: number };

/** All subjects. (The class_subjects join was removed in the v2 schema.) */
export async function getSubjects(): Promise<SubjectWithCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select(`id, code, name, description`)
    .order("name", { ascending: true })
    .returns<Subject[]>();

  if (error) throw new Error(error.message);

  return (data ?? []).map((s) => ({ ...s, classCount: 0 }));
}
