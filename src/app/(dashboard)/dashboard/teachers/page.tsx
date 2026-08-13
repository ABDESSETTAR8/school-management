import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { getTeachers } from "@/features/teachers/queries";
import { TeachersTable } from "@/features/teachers/components/teachers-table";

export const metadata: Metadata = { title: "Teachers" };

const PAGE_SIZE = 10;

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requirePermission("teachers");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await getTeachers({ q, page, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Teachers</h1>
        <p className="text-sm text-muted-foreground">
          Manage teachers, salaries, and payments.
        </p>
      </div>
      <TeachersTable teachers={rows} q={q} page={page} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}
