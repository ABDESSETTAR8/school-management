"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: string } | null;

/** Enroll one or more students into a class (status = active). */
export async function enrollStudents(
  classId: string,
  studentIds: string[],
): Promise<ActionState> {
  await requireRole(["admin"]);
  if (studentIds.length === 0) return { error: "Select at least one student." };

  const supabase = await createClient();
  const rows = studentIds.map((student_id) => ({
    class_id: classId,
    student_id,
    status: "active" as const,
  }));

  const { error } = await supabase.from("enrollments").insert(rows);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/classes/${classId}`);
  revalidatePath("/dashboard/classes");
  return { success: `Enrolled ${studentIds.length} student(s).` };
}

/** Remove a student from a class by deleting the enrollment row. */
export async function removeEnrollment(
  enrollmentId: string,
  classId: string,
): Promise<ActionState> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/classes/${classId}`);
  revalidatePath("/dashboard/classes");
  return { success: "Student removed from class." };
}
