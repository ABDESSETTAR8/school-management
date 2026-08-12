"use client";

import { useMemo, useState, useTransition } from "react";
import { BellOff, Check, Loader2, Trash2 } from "lucide-react";
import { clearAll, markAllRead } from "../actions";
import type { Notification } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(q) || (n.body?.toLowerCase().includes(q) ?? false),
    );
  }, [notifications, query]);

  const unread = notifications.filter((n) => !n.is_read).length;

  function run(fn: () => Promise<{ error?: string; success?: string } | null>) {
    start(async () => {
      const r = await fn();
      if (r?.error) toast({ title: r.error, variant: "error" });
      else toast({ title: r?.success ?? "Done.", variant: "success" });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notifications…"
          className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={pending || unread === 0} onClick={() => run(markAllRead)}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            disabled={pending || notifications.length === 0}
            onClick={() => run(clearAll)}
          >
            <Trash2 className="size-4" /> Clear all
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <BellOff className="size-8 opacity-40" />
          <p className="text-sm">{notifications.length === 0 ? "No notifications." : "No matches."}</p>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {filtered.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.is_read ? "" : "bg-primary/5"}`}>
              {!n.is_read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
              <div className={`min-w-0 flex-1 ${n.is_read ? "pl-5" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{n.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
