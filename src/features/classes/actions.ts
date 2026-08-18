"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { classSchema, type ActionState } from "./schema";

const CLASSES_PATH = "/dashboard/classes";

async function currentAcademicYearId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const { data } = await supabase
    .from("academic_years")
    .select("id")
    .eq("is_current", true)
    .maybeSingle<{ id: string }>();
  return data?.id ?? null;
}

export async function saveClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("classes");

  const parsed = classSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();

  if (d.classId) {
    const { error } = await supabase.from("classes").update({ name: d.name }).eq("id", d.classId);
    if (error) return { error: error.message };
    revalidatePath(CLASSES_PATH);
    return { success: "Class updated." };
  }

  const yearId = await currentAcademicYearId(supabase);
  if (!yearId) {
    return { error: "No current academic year. Set one in Settings first." };
  }

  const { error } = await supabase.from("classes").insert({
    academic_year_id: yearId,
    name: d.name,
    grade_level: 0,
  });
  if (error) return { error: error.message };

  revalidatePath(CLASSES_PATH);
  return { success: "Class created." };
}

export async function deleteClass(classId: string): Promise<ActionState> {
  await requirePermission("classes");
  const supabase = await createClient();
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) return { error: error.message };
  revalidatePath(CLASSES_PATH);
  return { success: "Class deleted." };
}
