"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { recordPayment } from "../actions";
import type { ActionState } from "../schema";
import type { TeacherListItem } from "@/types/database.types";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotifyButtons } from "@/components/ui/notify-buttons";
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
      Record payment
    </Button>
  );
}

export function PaymentDialog({ teacher }: { teacher: TeacherListItem }) {
  const [state, formAction] = useActionState<ActionState, FormData>(recordPayment, null);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(teacher.remaining || teacher.salary || ""));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  useActionToast(state);

  useEffect(() => {
    if (!open) {
      setAmount(String(teacher.remaining || teacher.salary || ""));
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, teacher.remaining, teacher.salary]);

  const message = `Dear ${teacher.first_name} ${teacher.last_name}, we confirm your salary payment of ${amount} DZD on ${date}. Thank you. — ${siteConfig.name}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment · {teacher.first_name} {teacher.last_name}</DialogTitle>
          <DialogDescription>
            Salary {teacher.salary.toLocaleString()} DZD · remaining this month{" "}
            {teacher.remaining.toLocaleString()} DZD
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{state.success} Send a confirmation:</span>
            </div>
            <NotifyButtons phone={teacher.phone} message={message} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
            <input type="hidden" name="teacherId" value={teacher.id} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (DZD)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paymentDate">Date</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="method">Method</Label>
                <select id="method" name="method" defaultValue="cash" className={selectClass}>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Note</Label>
                <Input id="note" name="note" />
              </div>
            </div>

            <DialogFooter>
              <SaveButton />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
