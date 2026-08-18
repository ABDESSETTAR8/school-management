import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { getAllPayments } from "@/features/payments/queries";
import { getSchoolSettings } from "@/features/settings/queries";
import { PaymentsTable } from "@/features/payments/components/payments-table";

export const metadata: Metadata = { title: "Payments" };

const PAGE_SIZE = 15;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePermission("billing");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ rows, total }, school] = await Promise.all([
    getAllPayments({ q, page, pageSize: PAGE_SIZE }),
    getSchoolSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          All student and teacher payments, with printable receipts.
        </p>
      </div>
      <PaymentsTable
        rows={rows}
        schoolName={school.school_name}
        q={q}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
