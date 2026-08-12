"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: string } | null;

/** Assign one or more students to a class. */
export async function enrollStudents(
  classId: string,
  studentIds: string[],
): Promise<ActionState> {
  await requirePermission("classes");
  if (studentIds.length === 0) return { error: "Select at least one student." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ class_id: classId })
    .in("id", studentIds);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/classes/${classId}`);
  revalidatePath("/dashboard/classes");
  return { success: `Assigned ${studentIds.length} student(s).` };
}

/** Remove a student from a class (unset class_id). */
export async function removeEnrollment(
  studentId: string,
  classId: string,
): Promise<ActionState> {
  await requirePermission("classes");
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ class_id: null })
    .eq("id", studentId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/classes/${classId}`);
  revalidatePath("/dashboard/classes");
  return { success: "Student removed from class." };
}
