"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveTeacher } from "../actions";
import type { ActionState } from "../schema";
import type { TeacherListItem } from "@/types/database.types";
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

export function TeacherDialog({
  trigger,
  teacher,
}: {
  trigger: React.ReactNode;
  teacher?: TeacherListItem;
}) {
  const isEdit = Boolean(teacher);
  const [state, formAction] = useActionState<ActionState, FormData>(saveTeacher, null);
  const [open, setOpen] = useState(false);
  useActionToast(state);
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit teacher" : "Add teacher"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this teacher's details." : "Add a teacher and their monthly salary."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isEdit && <input type="hidden" name="teacherId" value={teacher!.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={teacher?.first_name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={teacher?.last_name} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={teacher?.phone ?? ""} placeholder="0555…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={teacher?.email ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subjects">Subjects</Label>
            <Input
              id="subjects"
              name="subjects"
              placeholder="Math, Physics"
              defaultValue={teacher?.subjects.join(", ") ?? ""}
            />
            <p className="text-xs text-muted-foreground">Separate multiple subjects with commas.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="salary">Monthly salary (DZD)</Label>
              <Input id="salary" name="salary" type="number" min={0} step="500" defaultValue={teacher?.salary ?? 0} required />
            </div>
            {isEdit && (
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={teacher?.isActive}
                    className="size-4 rounded border-input accent-primary"
                  />
                  Active
                </label>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={teacher?.notes ?? ""} />
          </div>

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Add teacher"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
