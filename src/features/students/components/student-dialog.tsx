"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createStudent, updateStudent } from "../actions";
import { GENDER_OPTIONS, type ActionState } from "../schema";
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

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function StudentDialog({
  trigger,
  student,
}: {
  trigger: React.ReactNode;
  student?: StudentListItem;
}) {
  const isEdit = Boolean(student);
  const action = isEdit ? updateStudent : createStudent;
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  useActionToast(state);

  // Close on success once the server action reports it.
  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit student" : "Add student"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this student's details."
              : "Create a student account and admission record."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {isEdit && (
            <>
              <input type="hidden" name="studentId" value={student!.id} />
              <input type="hidden" name="profileId" value={student!.profile.id} />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={student?.profile.first_name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={student?.profile.last_name} required />
            </div>
          </div>

          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Temp. password</Label>
                <Input id="password" name="password" type="text" minLength={8} required />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="admissionNo">Admission no.</Label>
              <Input id="admissionNo" name="admissionNo" defaultValue={student?.admission_no} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admissionDate">Admission date</Label>
              <Input
                id="admissionDate"
                name="admissionDate"
                type="date"
                defaultValue={student?.admission_date ?? new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" name="gender" defaultValue={student?.profile.gender ?? "undisclosed"} className={selectClass}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={student?.profile.phone ?? ""} />
            </div>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={student?.profile.is_active}
                className="size-4 rounded border-input accent-primary"
              />
              Account active
            </label>
          )}

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Create student"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
