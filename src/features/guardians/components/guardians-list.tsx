"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Trash2, Users2, X } from "lucide-react";
import { deleteGuardian, unlinkChild } from "../actions";
import type { GuardianListItem, LinkableStudent } from "@/types/database.types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { GuardianDialog } from "./guardian-dialog";
import { LinkChildDialog } from "./link-child-dialog";

function ChildChip({
  guardianId,
  studentId,
  label,
}: {
  guardianId: string;
  studentId: string;
  label: string;
}) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs">
      {label}
      <button
        type="button"
        aria-label="Unlink child"
        disabled={pending}
        className="text-muted-foreground hover:text-destructive disabled:opacity-50"
        onClick={() =>
          start(async () => {
            const r = await unlinkChild(guardianId, studentId);
            if (r?.error) toast({ title: r.error, variant: "error" });
            else toast({ title: r?.success ?? "Unlinked.", variant: "success" });
          })
        }
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
      </button>
    </span>
  );
}

function DeleteGuardian({ profileId, name }: { profileId: string; name: string }) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      aria-label="Delete parent"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await deleteGuardian(profileId);
          if (r?.error) toast({ title: r.error, variant: "error" });
          else toast({ title: `${name} removed.`, variant: "success" });
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}

export function GuardiansList({
  guardians,
  students,
}: {
  guardians: GuardianListItem[];
  students: LinkableStudent[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guardians;
    return guardians.filter((g) =>
      `${g.profile.first_name} ${g.profile.last_name} ${g.profile.email}`.toLowerCase().includes(q),
    );
  }, [guardians, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parents…"
          className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <GuardianDialog />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Users2 className="size-8 opacity-40" />
          <p className="text-sm">{guardians.length === 0 ? "No parent accounts yet." : "No matches."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((g) => (
            <Card key={g.id}>
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(g.profile.first_name, g.profile.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {g.profile.first_name} {g.profile.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{g.profile.email}</p>
                  </div>
                </div>
                <DeleteGuardian
                  profileId={g.profile.id}
                  name={`${g.profile.first_name} ${g.profile.last_name}`}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {g.children.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No children linked.</span>
                  ) : (
                    g.children.map((c) => (
                      <ChildChip
                        key={c.studentId}
                        guardianId={g.id}
                        studentId={c.studentId}
                        label={`${c.name} · ${c.relationship}`}
                      />
                    ))
                  )}
                </div>
                <LinkChildDialog
                  guardianId={g.id}
                  students={students}
                  linkedIds={g.children.map((c) => c.studentId)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {guardians.length} parent{guardians.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
