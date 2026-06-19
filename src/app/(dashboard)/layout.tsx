import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/config/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();
  const roleLabel = ROLE_LABELS[profile.role];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar profile={profile} roleLabel={roleLabel} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
