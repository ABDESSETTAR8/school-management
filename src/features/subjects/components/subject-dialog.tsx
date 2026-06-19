"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveSubject } from "../actions";
import type { ActionState } from "../schema";
import type { Subject } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}

export function SubjectDialog({
  trigger,
  subject,
}: {
  trigger: React.ReactNode;
  subject?: Subject;
}) {
  const isEdit = Boolean(subject);
  const [state, formAction] = useActionState<ActionState, FormData>(saveSubject, null);
  const [open, setOpen] = useState(false);
  useActionToast(state);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this subject." : "Create a new subject for the catalog."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isEdit && <input type="hidden" name="subjectId" value={subject!.id} />}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" placeholder="MATH" defaultValue={subject?.code} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Mathematics" defaultValue={subject?.name} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" defaultValue={subject?.description ?? ""} />
          </div>

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Create subject"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
