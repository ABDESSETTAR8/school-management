import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getAcademicYears } from "@/features/settings/queries";
import { YearsManager } from "@/features/settings/components/years-manager";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireRole(["admin"]);
  const years = await getAcademicYears();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage academic years and terms. The current year is used when creating new classes.
        </p>
      </div>
      <YearsManager years={years} />
    </div>
  );
}
