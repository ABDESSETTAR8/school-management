"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createStudent, updateStudent } from "../actions";
import { GENDER_OPTIONS, STATUS_OPTIONS, type ActionState } from "../schema";
import type { StudentListItem } from "@/types/database.types";
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

export function StudentDialog({
  trigger,
  student,
  classes,
  groups,
  currentClassId,
  currentGroupId,
}: {
  trigger: React.ReactNode;
  student?: StudentListItem;
  classes: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  currentClassId?: string | null;
  currentGroupId?: string | null;
}) {
  const isEdit = Boolean(student);
  const action = isEdit ? updateStudent : createStudent;
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  useActionToast(state);
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit student" : "Register student"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this student's record." : "Add a new student and assign a class & group."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isEdit && <input type="hidden" name="studentId" value={student!.id} />}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={student?.first_name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={student?.last_name} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" name="gender" defaultValue={student?.gender ?? "undisclosed"} className={selectClass}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" max={today} defaultValue={student?.date_of_birth ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="classId">Class</Label>
              <select id="classId" name="classId" defaultValue={currentClassId ?? ""} className={selectClass}>
                <option value="">—</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groupId">Group</Label>
              <select id="groupId" name="groupId" defaultValue={currentGroupId ?? ""} className={selectClass}>
                <option value="">—</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="parentName">Parent / guardian</Label>
              <Input id="parentName" name="parentName" defaultValue={student?.parent_name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">Parent phone</Label>
              <Input id="parentPhone" name="parentPhone" defaultValue={student?.parent_phone ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={student?.address ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="registrationDate">Registration date</Label>
              <Input id="registrationDate" name="registrationDate" type="date" defaultValue={student?.registration_date ?? today} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={student?.status ?? "active"} className={selectClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={student?.notes ?? ""} />
          </div>

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Register student"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
