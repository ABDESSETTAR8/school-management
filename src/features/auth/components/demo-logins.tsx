"use client";

import { useState, useTransition } from "react";
import { Loader2, Shield, Briefcase, BookOpen, GraduationCap, Users } from "lucide-react";
import { demoLogin } from "../actions";
import { DEMO_ACCOUNTS } from "../schema";
import { cn } from "@/lib/utils";

const ICON_BY_ROLE = {
  admin: Shield,
  worker: Briefcase,
  teacher: BookOpen,
  student: GraduationCap,
  parent: Users,
} as const;

export function DemoLogins() {
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function go(email: string) {
    setError(null);
    setActive(email);
    startTransition(async () => {
      const res = await demoLogin(email);
      if (res?.error) {
        setError(res.error);
        setActive(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or explore a demo
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((a) => {
          const Icon = ICON_BY_ROLE[a.role];
          const loading = pending && active === a.email;
          return (
            <button
              key={a.email}
              type="button"
              disabled={pending}
              onClick={() => go(a.email)}
              className={cn(
                "group flex flex-col items-start gap-1 rounded-lg border border-input bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent disabled:opacity-60",
                loading && "border-primary/60",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {loading ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Icon className="size-4 text-primary" />
                )}
                {a.label}
              </span>
              <span className="text-xs text-muted-foreground">{a.blurb}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}
      <p className="text-center text-xs text-muted-foreground">
        Demo accounts are read-only previews for each role.
      </p>
    </div>
  );
}
