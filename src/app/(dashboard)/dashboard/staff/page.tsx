import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getStaff } from "@/features/staff/queries";
import { StaffTable } from "@/features/staff/components/staff-table";

export const metadata: Metadata = { title: "Staff" };

export default async function StaffPage() {
  await requireRole(["admin", "worker"]);
  const staff = await getStaff();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
        <p className="text-sm text-muted-foreground">
          Manage teacher, worker, and administrator accounts.
        </p>
      </div>
      <StaffTable staff={staff} />
    </div>
  );
}
