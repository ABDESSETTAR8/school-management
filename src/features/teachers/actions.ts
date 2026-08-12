"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/create";
import { logAudit } from "@/features/audit/log";
import { paymentSchema, teacherSchema, type ActionState } from "./schema";

const PATH = "/dashboard/teachers";

export async function saveTeacher(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("teachers");
  const parsed = teacherSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const row = {
    first_name: d.firstName,
    last_name: d.lastName || "",
    phone: d.phone || null,
    email: d.email || null,
    subjects: (d.subjects || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    salary: d.salary,
    notes: d.notes || null,
    is_active: d.isActive ?? true,
  };

  if (d.teacherId) {
    const { error } = await supabase.from("teachers").update(row).eq("id", d.teacherId);
    if (error) return { error: error.message };
    revalidatePath(PATH);
    return { success: "Teacher updated." };
  }

  const { error } = await supabase.from("teachers").insert(row);
  if (error) return { error: error.message };
  await createNotification("teacher", "Teacher added", `${row.first_name} ${row.last_name}`.trim());
  revalidatePath(PATH);
  return { success: "Teacher added." };
}

export async function deleteTeacher(teacherId: string): Promise<ActionState> {
  await requirePermission("teachers");
  const supabase = await createClient();
  const { error } = await supabase.from("teachers").delete().eq("id", teacherId);
  if (error) return { error: error.message };
  await logAudit("delete", "teacher", teacherId);
  revalidatePath(PATH);
  return { success: "Teacher removed." };
}

export async function recordPayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("teachers");
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("teacher_payments").insert({
    teacher_id: d.teacherId,
    amount: d.amount,
    payment_date: d.paymentDate,
    method: d.method || null,
    note: d.note || null,
  });
  if (error) return { error: error.message };

  await createNotification("payment", "Teacher payment recorded", `${d.amount.toLocaleString()} DZD`);
  await logAudit("payment", "teacher", `${d.amount} DZD to teacher ${d.teacherId}`);
  revalidatePath(PATH);
  return { success: "Payment recorded." };
}
