import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PaymentLedgerRow } from "@/types/database.types";

/** Combined payments ledger — student fees + teacher salaries, newest first. */
export async function getAllPayments({
  q = "",
  page = 1,
  pageSize = 15,
}: { q?: string; page?: number; pageSize?: number } = {}): Promise<{
  rows: PaymentLedgerRow[];
  total: number;
}> {
  const supabase = await createClient();

  const [sp, tp] = await Promise.all([
    supabase
      .from("student_payments")
      .select("id, amount, created_at, purpose, method, for_month, student:students ( first_name, last_name )")
      .order("created_at", { ascending: false })
      .limit(1000)
      .returns<
        {
          id: string;
          amount: number;
          created_at: string;
          purpose: string;
          method: string | null;
          for_month: string;
          student: { first_name: string; last_name: string } | null;
        }[]
      >(),
    supabase
      .from("teacher_payments")
      .select("id, amount, payment_date, method, note, teacher:teachers ( first_name, last_name )")
      .order("payment_date", { ascending: false })
      .limit(1000)
      .returns<
        {
          id: string;
          amount: number;
          payment_date: string;
          method: string | null;
          note: string | null;
          teacher: { first_name: string; last_name: string } | null;
        }[]
      >(),
  ]);

  const rows: PaymentLedgerRow[] = [
    ...(sp.data ?? []).map((p) => ({
      id: p.id,
      type: "student" as const,
      payee: p.student ? `${p.student.first_name} ${p.student.last_name}` : "Student",
      amount: Number(p.amount),
      date: p.created_at,
      purpose: p.purpose,
      method: p.method,
      forMonth: p.for_month,
    })),
    ...(tp.data ?? []).map((p) => ({
      id: p.id,
      type: "teacher" as const,
      payee: p.teacher ? `${p.teacher.first_name} ${p.teacher.last_name}` : "Teacher",
      amount: Number(p.amount),
      date: p.payment_date,
      purpose: p.note || "Salary",
      method: p.method,
      forMonth: null,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const s = q.trim().toLowerCase();
  const filtered = s
    ? rows.filter((r) => r.payee.toLowerCase().includes(s) || r.purpose.toLowerCase().includes(s))
    : rows;

  const from = (page - 1) * pageSize;
  return { rows: filtered.slice(from, from + pageSize), total: filtered.length };
}
