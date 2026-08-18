"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveClass } from "../actions";
import type { ActionState } from "../schema";
import type { ClassListItem } from "@/types/database.types";
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

export function ClassDialog({
  trigger,
  cls,
}: {
  trigger: React.ReactNode;
  cls?: ClassListItem;
}) {
  const isEdit = Boolean(cls);
  const [state, formAction] = useActionState<ActionState, FormData>(saveClass, null);
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
          <DialogTitle>{isEdit ? "Edit class" : "Add class"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Rename this class." : "Create a new class."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isEdit && <input type="hidden" name="classId" value={cls!.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="name">Class name</Label>
            <Input id="name" name="name" placeholder="e.g. 3rd Year Science" defaultValue={cls?.name} required autoFocus />
          </div>

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Create class"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
