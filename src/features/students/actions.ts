"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createStudentSchema,
  updateStudentSchema,
  type ActionState,
} from "./schema";

const STUDENTS_PATH = "/dashboard/students";

export async function createStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin", "worker"]);

  const parsed = createStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  // 1. Create the auth user. The on_auth_user_created trigger creates the profile
  //    from this metadata (role defaults to 'student').
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { first_name: d.firstName, last_name: d.lastName, role: "student" },
  });
  if (authError || !created.user) {
    return { error: authError?.message ?? "Could not create the account." };
  }
  const userId = created.user.id;

  // 2. Enrich the profile with optional fields.
  await admin
    .from("profiles")
    .update({ phone: d.phone || null, gender: d.gender ?? null })
    .eq("id", userId);

  // 3. Create the student record.
  const { error: studentError } = await admin.from("students").insert({
    profile_id: userId,
    admission_no: d.admissionNo,
    admission_date: d.admissionDate,
  });
  if (studentError) {
    // Roll back the auth user so we don't orphan an account.
    await admin.auth.admin.deleteUser(userId);
    return { error: studentError.message };
  }

  revalidatePath(STUDENTS_PATH);
  return { success: "Student created." };
}

export async function updateStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin", "worker"]);

  const parsed = updateStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: d.firstName,
      last_name: d.lastName,
      phone: d.phone || null,
      gender: d.gender ?? null,
      is_active: d.isActive ?? true,
    })
    .eq("id", d.profileId);
  if (profileError) return { error: profileError.message };

  const { error: studentError } = await supabase
    .from("students")
    .update({ admission_no: d.admissionNo, admission_date: d.admissionDate })
    .eq("id", d.studentId);
  if (studentError) return { error: studentError.message };

  revalidatePath(STUDENTS_PATH);
  return { success: "Student updated." };
}

export async function deleteStudent(profileId: string): Promise<ActionState> {
  await requireRole(["admin", "worker"]);

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  // Deleting the auth user cascades to profiles → students via FK on delete cascade.
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) return { error: error.message };

  revalidatePath(STUDENTS_PATH);
  return { success: "Student removed." };
}
