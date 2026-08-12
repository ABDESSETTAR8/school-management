import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { getAcademicYears, getSchoolSettings } from "@/features/settings/queries";
import { getLocale } from "@/i18n/server";
import { YearsManager } from "@/features/settings/components/years-manager";
import { SchoolSettingsForm } from "@/features/settings/components/school-settings-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("settings");
  const [years, school, locale] = await Promise.all([
    getAcademicYears(),
    getSchoolSettings(),
    getLocale(),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your school, appearance, and academic years.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">School information</CardTitle>
          </CardHeader>
          <CardContent>
            <SchoolSettingsForm settings={school} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Choose your theme.</p>
              <ThemeToggle />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Language</p>
              <LanguageSwitcher current={locale} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Academic years</h2>
        <YearsManager years={years} />
      </div>
    </div>
  );
}
