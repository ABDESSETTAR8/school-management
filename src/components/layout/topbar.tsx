import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "./user-menu";
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
      <div className="relative hidden max-w-sm flex-1 items-center md:flex">
        <Search className="absolute left-3 size-4 text-muted-foreground" />
        <input
          placeholder="Search…"
          className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

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
