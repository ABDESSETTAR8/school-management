"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveClass } from "../actions";
import type { ActionState } from "../schema";
import type { ClassListItem, TeacherOption } from "@/types/database.types";
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

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

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
  teachers,
  cls,
  currentHomeroomId,
}: {
  trigger: React.ReactNode;
  teachers: TeacherOption[];
  cls?: ClassListItem;
  currentHomeroomId?: string | null;
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
            {isEdit ? "Update this class section." : "Create a new class section for the current year."}
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
            <Input id="name" name="name" placeholder="e.g. Grade 7 - C" defaultValue={cls?.name} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gradeLevel">Grade level</Label>
              <Input id="gradeLevel" name="gradeLevel" type="number" min={1} max={13} defaultValue={cls?.grade_level ?? 7} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min={1} max={200} defaultValue={cls?.capacity ?? 30} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="homeroomTeacherId">Homeroom teacher</Label>
            <select
              id="homeroomTeacherId"
              name="homeroomTeacherId"
              defaultValue={currentHomeroomId ?? ""}
              className={selectClass}
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Create class"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
