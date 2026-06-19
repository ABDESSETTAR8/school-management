"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStaffSchema, updateStaffSchema, type ActionState } from "./schema";

const PATH = "/dashboard/staff";

export async function createStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);

  const parsed = createStaffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  // Create the auth user; the trigger creates the profile with this role.
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: { first_name: d.firstName, last_name: d.lastName, role: d.role },
  });
  if (authError || !created.user) {
    return { error: authError?.message ?? "Could not create the account." };
  }
  const userId = created.user.id;

  const { error: staffError } = await admin.from("staff").insert({
    profile_id: userId,
    employee_no: d.employeeNo,
    job_title: d.jobTitle || null,
    department: d.department || null,
    hire_date: d.hireDate,
  });
  if (staffError) {
    await admin.auth.admin.deleteUser(userId);
    return {
      error: staffError.code === "23505" ? "That employee number already exists." : staffError.message,
    };
  }

  revalidatePath(PATH);
  return { success: "Staff member created." };
}

export async function updateStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin"]);

  const parsed = updateStaffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;
  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: d.firstName,
      last_name: d.lastName,
      role: d.role,
      is_active: d.isActive ?? true,
    })
    .eq("id", d.profileId);
  if (profileError) return { error: profileError.message };

  const { error: staffError } = await supabase
    .from("staff")
    .update({
      employee_no: d.employeeNo,
      job_title: d.jobTitle || null,
      department: d.department || null,
      hire_date: d.hireDate,
    })
    .eq("id", d.staffId);
  if (staffError) return { error: staffError.message };

  revalidatePath(PATH);
  return { success: "Staff member updated." };
}

export async function deleteStaff(profileId: string): Promise<ActionState> {
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
  return { success: "Staff member removed." };
}
