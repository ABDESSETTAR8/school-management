import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { getClasses, getTeacherOptions } from "@/features/classes/queries";
import { getMyStaffId, getOfferings } from "@/features/attendance/queries";
import { ClassesGrid } from "@/features/classes/components/classes-grid";
import { TeacherClasses } from "@/features/classes/components/teacher-classes";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Classes" };

export default async function ClassesPage() {
  const { profile } = await requireUser();

  if (profile.role === "admin") {
    const [classes, teachers] = await Promise.all([getClasses(), getTeacherOptions()]);
    return (
      <div className="space-y-6">
        <Header
          title="Classes"
          subtitle="Manage class sections and their student rosters."
        />
        <ClassesGrid classes={classes} teachers={teachers} />
      </div>
    );
  }

  if (profile.role === "teacher") {
    const staffId = await getMyStaffId();
    const offerings = await getOfferings("teacher", staffId);
    return (
      <div className="space-y-6">
        <Header title="My classes" subtitle="The classes and subjects you teach." />
        <TeacherClasses offerings={offerings} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Classes" subtitle="" />
      <Card className="flex items-center justify-center py-16 text-center text-sm text-muted-foreground">
        This view isn&apos;t available for your role.
      </Card>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
