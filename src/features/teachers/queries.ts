import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TeacherListItem, TeacherOption, TeacherPayment } from "@/types/database.types";

type RawTeacher = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  subjects: string[] | null;
  salary: number;
  notes: string | null;
  is_active: boolean;
  groups: { count: number }[];
  teacher_payments: TeacherPayment[];
};

function monthKey(d: string) {
  return d.slice(0, 7); // YYYY-MM
}

/** All teachers with groups count + this-month payment summary. */
export async function getTeachers(): Promise<TeacherListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select(
      `id, first_name, last_name, phone, email, subjects, salary, notes, is_active,
       groups ( count ),
       teacher_payments ( id, teacher_id, amount, payment_date, method, note )`,
    )
    .order("first_name", { ascending: true })
    .returns<RawTeacher[]>();

  if (error) throw new Error(error.message);

  const thisMonth = new Date().toISOString().slice(0, 7);

  return (data ?? []).map((t) => {
    const payments = [...(t.teacher_payments ?? [])].sort((a, b) =>
      b.payment_date.localeCompare(a.payment_date),
    );
    const paidThisMonth = payments
      .filter((p) => monthKey(p.payment_date) === thisMonth)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const salary = Number(t.salary) || 0;
    return {
      id: t.id,
      first_name: t.first_name,
      last_name: t.last_name,
      phone: t.phone,
      email: t.email,
      subjects: t.subjects ?? [],
      salary,
      notes: t.notes,
      isActive: t.is_active,
      groupsCount: t.groups?.[0]?.count ?? 0,
      paidThisMonth,
      remaining: Math.max(0, salary - paidThisMonth),
      lastPaymentDate: payments[0]?.payment_date ?? null,
      payments,
    };
  });
}

/** Teachers as selectable options (for group assignment). */
export async function getTeacherOptions(): Promise<TeacherOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, first_name, last_name")
    .eq("is_active", true)
    .order("first_name")
    .returns<{ id: string; first_name: string; last_name: string }[]>();

  if (error) throw new Error(error.message);
  return (data ?? []).map((t) => ({ id: t.id, name: `${t.first_name} ${t.last_name}` }));
}
