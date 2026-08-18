"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { recordStudentPayment } from "../actions";
import type { ActionState } from "../schema";
import type { BillingRow } from "@/types/database.types";
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

export function PayDialog({ row }: { row: BillingRow }) {
  const [state, formAction] = useActionState<ActionState, FormData>(recordStudentPayment, null);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(0, row.monthlyFee - row.paidThisMonth) || row.monthlyFee || ""));
  const month = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().slice(0, 10);
  useActionToast(state);

  const message = `Dear parent, we confirm a payment of ${amount} DZD for ${row.name} (${siteConfig.name}). Thank you.`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment · {row.name}</DialogTitle>
          <DialogDescription>
            {row.groupName ? `${row.groupName} · ` : ""}Fee {row.monthlyFee.toLocaleString()} DZD ·
            paid this month {row.paidThisMonth.toLocaleString()} DZD
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{state.success} Notify the parent:</span>
            </div>
            <NotifyButtons phone={row.parentPhone} message={message} />
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
            <input type="hidden" name="studentId" value={row.id} />
            <input type="hidden" name="forMonth" value={month} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (DZD)</Label>
                <Input id="amount" name="amount" type="number" min={1} step="100" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paidOn">Date</Label>
                <Input id="paidOn" name="paidOn" type="date" defaultValue={today} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose</Label>
                <select id="purpose" name="purpose" defaultValue="Monthly fee" className={selectClass}>
                  <option>Monthly fee</option>
                  <option>Registration</option>
                  <option>Books</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="method">Method</Label>
                <select id="method" name="method" defaultValue="cash" className={selectClass}>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Note</Label>
              <Input id="note" name="note" />
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
