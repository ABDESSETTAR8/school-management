"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { saveGroup } from "../actions";
import type { ActionState } from "../schema";
import type { GroupListItem, TeacherOption } from "@/types/database.types";
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

export function GroupDialog({
  trigger,
  group,
  classes,
  teachers,
  currentClassId,
  currentTeacherId,
}: {
  trigger: React.ReactNode;
  group?: GroupListItem;
  classes: { id: string; name: string }[];
  teachers: TeacherOption[];
  currentClassId?: string | null;
  currentTeacherId?: string | null;
}) {
  const isEdit = Boolean(group);
  const [state, formAction] = useActionState<ActionState, FormData>(saveGroup, null);
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
          <DialogTitle>{isEdit ? "Edit group" : "Add group"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this group." : "Create a group with its schedule and monthly fee."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isEdit && <input type="hidden" name="groupId" value={group!.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="name">Group name</Label>
            <Input id="name" name="name" placeholder="e.g. Math - Group A" defaultValue={group?.name} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="classId">Class</Label>
              <select id="classId" name="classId" defaultValue={currentClassId ?? ""} className={selectClass}>
                <option value="">—</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="teacherId">Teacher</Label>
              <select id="teacherId" name="teacherId" defaultValue={currentTeacherId ?? ""} className={selectClass}>
                <option value="">—</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="classroom">Classroom</Label>
              <Input id="classroom" name="classroom" defaultValue={group?.classroom ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schedule">Schedule</Label>
              <Input id="schedule" name="schedule" placeholder="Mon & Wed 17:00" defaultValue={group?.schedule ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min={1} max={500} defaultValue={group?.capacity ?? 20} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthlyFee">Monthly fee (DZD)</Label>
              <Input id="monthlyFee" name="monthlyFee" type="number" min={0} step="50" defaultValue={group?.monthlyFee ?? 3000} required />
            </div>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={group?.isActive}
                className="size-4 rounded border-input accent-primary"
              />
              Active
            </label>
          )}

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Create group"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
