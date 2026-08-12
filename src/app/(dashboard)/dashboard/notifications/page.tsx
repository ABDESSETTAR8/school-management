import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { getNotifications } from "@/features/notifications/queries";
import { NotificationsList } from "@/features/notifications/components/notifications-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  await requireRole(["admin", "worker"]);
  const notifications = await getNotifications(100);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Recent activity across the school.</p>
      </div>
      <NotificationsList notifications={notifications} />
    </div>
  );
}
