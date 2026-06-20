"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { termSchema, yearSchema, type ActionState } from "./schema";

const PATH = "/dashboard/settings";

export async function createYear(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const parsed = yearSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("academic_years")
    .insert({ name: d.name, start_date: d.startDate, end_date: d.endDate, is_current: false });
  if (error) {
    return { error: error.code === "23505" ? "That year name already exists." : error.message };
  }
  revalidatePath(PATH);
  return { success: "Academic year created." };
}

export async function setCurrentYear(yearId: string): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();

  // Only one current year allowed (enforced by a partial unique index),
  // so clear the existing current first.
  const { error: clearErr } = await supabase
    .from("academic_years")
    .update({ is_current: false })
    .eq("is_current", true);
  if (clearErr) return { error: clearErr.message };

  const { error } = await supabase
    .from("academic_years")
    .update({ is_current: true })
    .eq("id", yearId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  revalidatePath("/dashboard");
  return { success: "Current year updated." };
}

export async function deleteYear(yearId: string): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();
  const { error } = await supabase.from("academic_years").delete().eq("id", yearId);
  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Can't delete: classes are still attached to this year."
          : error.message,
    };
  }
  revalidatePath(PATH);
  return { success: "Academic year deleted." };
}

export async function createTerm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const parsed = termSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("terms").insert({
    academic_year_id: d.academicYearId,
    name: d.name,
    kind: d.kind,
    start_date: d.startDate,
    end_date: d.endDate,
  });
  if (error) {
    return { error: error.code === "23505" ? "That term already exists for this year." : error.message };
  }
  revalidatePath(PATH);
  return { success: "Term added." };
}

export async function deleteTerm(termId: string): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();
  const { error } = await supabase.from("terms").delete().eq("id", termId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { success: "Term deleted." };
}
