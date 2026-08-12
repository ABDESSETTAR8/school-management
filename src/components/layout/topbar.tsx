import { Badge } from "@/components/ui/badge";
import { UserMenu } from "./user-menu";
import { SearchCommand } from "./search-command";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import type { Notification, Profile } from "@/types/database.types";

export function Topbar({
  profile,
  roleLabel,
  notifications,
  unreadCount,
}: {
  profile: Profile;
  roleLabel: string;
  notifications: Notification[];
  unreadCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <SearchCommand />

      <div className="ml-auto flex items-center gap-3">
        <NotificationBell notifications={notifications} unreadCount={unreadCount} />
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {roleLabel}
        </Badge>
        <UserMenu
          firstName={profile.first_name}
          lastName={profile.last_name}
          email={profile.email}
          avatarUrl={profile.avatar_url}
          roleLabel={roleLabel}
        />
      </div>
    </header>
  );
}
