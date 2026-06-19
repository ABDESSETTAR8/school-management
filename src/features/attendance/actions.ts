"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/types/database.types";

type ActionState = { error?: string; success?: string } | null;

export type AttendanceEntry = { studentId: string; status: AttendanceStatus };

/** Create/update the attendance session for a class-subject + date and upsert records. */
export async function saveAttendance(
  classSubjectId: string,
  date: string,
  entries: AttendanceEntry[],
): Promise<ActionState> {
  const { id: userId, profile } = await requireRole(["admin", "teacher"]);
  if (entries.length === 0) return { error: "No students to record." };

  const supabase = await createClient();

  // Resolve caller's staff id (teachers must set taken_by = their own staff id;
  // the RLS policy requires it). Admins pass the policy via is_admin().
  const { data: staff } = await supabase
    .from("staff")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle<{ id: string }>();

  if (profile.role === "teacher" && !staff) {
    return { error: "Your account is not linked to a staff record." };
  }

  // Get or create the session.
  let sessionId: string;
  const { data: existing } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("class_subject_id", classSubjectId)
    .eq("session_date", date)
    .maybeSingle<{ id: string }>();

  if (existing) {
    sessionId = existing.id;
  } else {
    const { data: created, error: sErr } = await supabase
      .from("attendance_sessions")
      .insert({
        class_subject_id: classSubjectId,
        session_date: date,
        taken_by: staff?.id ?? null,
      })
      .select("id")
      .single();
    if (sErr || !created) return { error: sErr?.message ?? "Could not create session." };
    sessionId = created.id;
  }

  const rows = entries.map((e) => ({
    session_id: sessionId,
    student_id: e.studentId,
    status: e.status,
  }));

  const { error: rErr } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "session_id,student_id" });
  if (rErr) return { error: rErr.message };

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard");
  return { success: `Saved attendance for ${entries.length} students.` };
}
