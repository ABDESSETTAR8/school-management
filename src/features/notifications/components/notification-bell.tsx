"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bell, Check, Loader2 } from "lucide-react";
import { markAllRead } from "../actions";
import type { Notification } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [pending, start] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
              disabled={pending}
              onClick={() => start(() => void markAllRead())}
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b border-border px-3 py-2.5 text-sm last:border-0 ${
                  n.is_read ? "" : "bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{n.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                </div>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-2">
          <Link
            href="/dashboard/notifications"
            className="block rounded-md px-2 py-1.5 text-center text-sm font-medium text-primary hover:bg-accent"
          >
            View all
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
