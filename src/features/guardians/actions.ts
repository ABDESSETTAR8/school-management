"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createGuardianSchema, linkChildSchema, type ActionState } from "./schema";

const PATH = "/dashboard/guardians";

export async function createGuardian(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);

  const parsed = createGuardianSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { first_name: d.firstName, last_name: d.lastName, role: "parent" },
  });
  if (authError || !created.user) {
    return { error: authError?.message ?? "Could not create the account." };
  }

  const { error: gErr } = await admin
    .from("guardians")
    .insert({ profile_id: created.user.id, occupation: d.occupation || null });
  if (gErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: gErr.message };
  }

  revalidatePath(PATH);
  return { success: "Parent account created." };
}

export async function linkChild(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);

  const parsed = linkChildSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("student_guardians").insert({
    guardian_id: d.guardianId,
    student_id: d.studentId,
    relationship: d.relationship,
  });
  if (error) {
    return { error: error.code === "23505" ? "That child is already linked." : error.message };
  }

  revalidatePath(PATH);
  return { success: "Child linked." };
}

export async function unlinkChild(guardianId: string, studentId: string): Promise<ActionState> {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_guardians")
    .delete()
    .eq("guardian_id", guardianId)
    .eq("student_id", studentId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { success: "Child unlinked." };
}

export async function deleteGuardian(profileId: string): Promise<ActionState> {
  await requireRole(["admin"]);

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { success: "Parent account removed." };
}
