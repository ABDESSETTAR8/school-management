"use client";

import { useState } from "react";
import { Printer, Receipt } from "lucide-react";
import type { PaymentLedgerRow } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ReceiptDialog({ row, schoolName }: { row: PaymentLedgerRow; schoolName: string }) {
  const [open, setOpen] = useState(false);
  const ref = `RCT-${row.type.slice(0, 3).toUpperCase()}-${row.id.slice(0, 8).toUpperCase()}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Receipt">
          <Receipt className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">Receipt</DialogTitle>
        </DialogHeader>

        <div className="print-receipt rounded-lg border border-border p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-lg font-semibold">{schoolName}</p>
              <p className="text-sm text-muted-foreground">Payment Receipt</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{ref}</p>
              <p>{new Date(row.date).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2 py-4 text-sm">
            <Line label="Received from" value={row.payee} />
            <Line label="Type" value={row.type === "student" ? "Student payment" : "Teacher salary"} />
            <Line label="Purpose" value={row.purpose} />
            {row.forMonth && <Line label="For month" value={row.forMonth} />}
            {row.method && <Line label="Method" value={row.method} />}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold">{row.amount.toLocaleString()} DZD</span>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Thank you. This is a computer-generated receipt.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
