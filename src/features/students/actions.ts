"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/create";
import { logAudit } from "@/features/audit/log";
import { createStudentSchema, updateStudentSchema, type ActionState } from "./schema";

const PATH = "/dashboard/students";

function rowFrom(d: {
  firstName: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  registrationDate: string;
  classId?: string;
  groupId?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  notes?: string;
  status?: string;
}) {
  return {
    first_name: d.firstName,
    last_name: d.lastName || "",
    gender: d.gender || null,
    date_of_birth: d.dateOfBirth || null,
    registration_date: d.registrationDate,
    class_id: d.classId && d.classId !== "" ? d.classId : null,
    group_id: d.groupId && d.groupId !== "" ? d.groupId : null,
    parent_name: d.parentName || null,
    parent_phone: d.parentPhone || null,
    address: d.address || null,
    notes: d.notes || null,
    status: d.status || "active",
  };
}

export async function createStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("students");
  const parsed = createStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase.from("students").insert(rowFrom(parsed.data));
  if (error) return { error: error.message };

  await createNotification(
    "student",
    "New student registered",
    `${parsed.data.firstName} ${parsed.data.lastName ?? ""}`.trim(),
  );
  revalidatePath(PATH);
  revalidatePath("/dashboard/groups");
  return { success: "Student registered." };
}

export async function updateStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("students");
  const parsed = updateStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { studentId, ...rest } = parsed.data;
  const { error } = await supabase.from("students").update(rowFrom(rest)).eq("id", studentId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  revalidatePath("/dashboard/groups");
  return { success: "Student updated." };
}

export async function deleteStudent(studentId: string): Promise<ActionState> {
  await requirePermission("students");
  const supabase = await createClient();
  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) return { error: error.message };

  await createNotification("student", "Student removed");
  await logAudit("delete", "student", studentId);
  revalidatePath(PATH);
  revalidatePath("/dashboard/groups");
  return { success: "Student removed." };
}
