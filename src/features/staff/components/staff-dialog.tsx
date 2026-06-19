"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { createStaff, updateStaff } from "../actions";
import { STAFF_ROLE_OPTIONS, type ActionState } from "../schema";
import type { StaffListItem } from "@/types/database.types";
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

export function StaffDialog({
  trigger,
  staff,
}: {
  trigger: React.ReactNode;
  staff?: StaffListItem;
}) {
  const isEdit = Boolean(staff);
  const action = isEdit ? updateStaff : createStaff;
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const [open, setOpen] = useState(false);
  useActionToast(state);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  const role = staff?.profile.role === "student" || staff?.profile.role === "parent"
    ? "worker"
    : staff?.profile.role ?? "teacher";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit staff member" : "Add staff member"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this staff member's details." : "Create a staff account."}
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
              <input type="hidden" name="staffId" value={staff!.id} />
              <input type="hidden" name="profileId" value={staff!.profile.id} />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" defaultValue={staff?.profile.first_name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" defaultValue={staff?.profile.last_name} required />
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
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" defaultValue={role} className={selectClass}>
                {STAFF_ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employeeNo">Employee no.</Label>
              <Input id="employeeNo" name="employeeNo" defaultValue={staff?.employee_no} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={staff?.job_title ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" defaultValue={staff?.department ?? ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hireDate">Hire date</Label>
              <Input
                id="hireDate"
                name="hireDate"
                type="date"
                defaultValue={staff?.hire_date ?? new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            {isEdit && (
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked={staff?.profile.is_active}
                    className="size-4 rounded border-input accent-primary"
                  />
                  Account active
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <SaveButton label={isEdit ? "Save changes" : "Create staff"} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
