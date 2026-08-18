import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BillingRow, BillingStatus, StudentPayment } from "@/types/database.types";

type RawBilling = {
  id: string;
  first_name: string;
  last_name: string;
  parent_name: string | null;
  parent_phone: string | null;
  group: { name: string; monthly_fee: number } | null;
  student_payments: StudentPayment[];
};

/** Paginated student billing list with this-month payment status. */
export async function getBilling({
  q = "",
  page = 1,
  pageSize = 10,
}: { q?: string; page?: number; pageSize?: number } = {}): Promise<{
  rows: BillingRow[];
  total: number;
}> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const month = new Date().toISOString().slice(0, 7);

  let query = supabase
    .from("students")
    .select(
      `id, first_name, last_name, parent_name, parent_phone,
       group:groups ( name, monthly_fee ),
       student_payments ( id, student_id, amount, paid_on, for_month, purpose, method, note, created_at )`,
      { count: "exact" },
    )
    .order("first_name", { ascending: true })
    .range(from, to);

  const s = q.replace(/[%,()]/g, "").trim();
  if (s.length >= 1) {
    query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,parent_name.ilike.%${s}%`);
  }

  const { data, count, error } = await query.returns<RawBilling[]>();
  if (error) throw new Error(error.message);

  const rows: BillingRow[] = (data ?? []).map((r) => {
    const monthlyFee = Number(r.group?.monthly_fee) || 0;
    const payments = [...(r.student_payments ?? [])].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
    const paidThisMonth = payments
      .filter((p) => p.for_month === month)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    let status: BillingStatus = "unpaid";
    if (monthlyFee > 0 && paidThisMonth >= monthlyFee) status = "paid";
    else if (paidThisMonth > 0) status = "partial";
    return {
      id: r.id,
      name: `${r.first_name} ${r.last_name}`,
      groupName: r.group?.name ?? null,
      monthlyFee,
      paidThisMonth,
      status,
      parentName: r.parent_name,
      parentPhone: r.parent_phone,
      payments,
    };
  });

  return { rows, total: count ?? 0 };
}
