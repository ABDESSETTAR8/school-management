import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { getBilling } from "@/features/billing/queries";
import { BillingTable } from "@/features/billing/components/billing-table";

export const metadata: Metadata = { title: "Billing" };

const PAGE_SIZE = 10;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePermission("billing");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await getBilling({ q, page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Record student payments and track who has paid this month.
        </p>
      </div>
      <BillingTable rows={rows} q={q} page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
