"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/create";
import { logAudit } from "@/features/audit/log";
import { studentPaymentSchema, type ActionState } from "./schema";

export async function recordStudentPayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("billing");
  const parsed = studentPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("student_payments").insert({
    student_id: d.studentId,
    amount: d.amount,
    paid_on: d.paidOn,
    for_month: d.forMonth,
    purpose: d.purpose,
    method: d.method || null,
    note: d.note || null,
  });
  if (error) return { error: error.message };

  await createNotification("billing", "Student payment received", `${d.amount.toLocaleString()} DZD · ${d.purpose}`);
  await logAudit("payment", "student", `${d.amount} DZD · ${d.purpose} · student ${d.studentId}`);
  revalidatePath("/dashboard/billing");
  return { success: "Payment recorded." };
}
