"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Link2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { linkChild } from "../actions";
import { RELATIONSHIP_OPTIONS, type ActionState } from "../schema";
import type { LinkableStudent } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Link child
    </Button>
  );
}

export function LinkChildDialog({
  guardianId,
  students,
  linkedIds,
}: {
  guardianId: string;
  students: LinkableStudent[];
  linkedIds: string[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(linkChild, null);
  const [open, setOpen] = useState(false);
  useActionToast(state);
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  const available = students.filter((s) => !linkedIds.includes(s.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="size-4" /> Link child
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a child</DialogTitle>
          <DialogDescription>Connect a student to this parent account.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          <input type="hidden" name="guardianId" value={guardianId} />
          <div className="space-y-1.5">
            <Label htmlFor="studentId">Student</Label>
            <select id="studentId" name="studentId" required defaultValue="" className={selectClass}>
              <option value="" disabled>
                Select a student…
              </option>
              {available.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.admission_no})
                </option>
              ))}
            </select>
            {available.length === 0 && (
              <p className="text-xs text-muted-foreground">All students are already linked.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="relationship">Relationship</Label>
            <select id="relationship" name="relationship" defaultValue="guardian" className={selectClass}>
              {RELATIONSHIP_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <SaveButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
