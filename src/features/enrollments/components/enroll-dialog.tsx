"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { enrollStudents } from "../actions";
import type { EnrollableStudent } from "@/types/database.types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EnrollDialog({
  classId,
  candidates,
}: {
  classId: string;
  candidates: EnrollableStudent[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = candidates.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.admission_no.toLowerCase().includes(q)
    );
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await enrollStudents(classId, [...selected]);
      if (res?.error) {
        setError(res.error);
        toast({ title: res.error, variant: "error" });
      } else {
        toast({ title: res?.success ?? "Students enrolled.", variant: "success" });
        setSelected(new Set());
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Enroll students
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll students</DialogTitle>
          <DialogDescription>
            Only students without an active class assignment are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No students available to enroll.
            </p>
          ) : (
            filtered.map((s) => {
              const checked = selected.has(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    checked ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{getInitials(s.first_name, s.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{s.admission_no}</p>
                  </div>
                  <span
                    className={`flex size-5 items-center justify-center rounded-md border ${
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                    }`}
                  >
                    {checked && <Plus className="size-3 rotate-45" />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending || selected.size === 0}>
            {pending && <Loader2 className="animate-spin" />}
            Enroll {selected.size > 0 ? `(${selected.size})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
