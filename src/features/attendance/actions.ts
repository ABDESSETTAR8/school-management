"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/database.types";
import { createNotification } from "@/features/notifications/create";

type ActionState = { error?: string; success?: string } | null;

export type AttendanceEntry = { studentId: string; status: AttendanceStatus };

/** Upsert attendance for every student in a group on a given date. */
export async function saveGroupAttendance(
  groupId: string,
  date: string,
  entries: AttendanceEntry[],
): Promise<ActionState> {
  await requirePermission("attendance");
  if (entries.length === 0) return { error: "No students to record." };

  const supabase = await createClient();
  const rows = entries.map((e) => ({
    group_id: groupId,
    student_id: e.studentId,
    date,
    status: e.status,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "group_id,student_id,date" });
  if (error) return { error: error.message };

  await createNotification("attendance", "Attendance recorded", `${entries.length} students · ${date}`);
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
  return { success: `Saved attendance for ${entries.length} students.` };
}
