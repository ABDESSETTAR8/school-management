"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";
import type { BillingRow } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function HistoryDialog({ row }: { row: BillingRow }) {
  const [open, setOpen] = useState(false);
  const total = row.payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Payment history">
          <Receipt className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment history · {row.name}</DialogTitle>
          <DialogDescription>
            {row.payments.length} payment{row.payments.length === 1 ? "" : "s"} ·{" "}
            {total.toLocaleString()} DZD total
          </DialogDescription>
        </DialogHeader>

        {row.payments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {row.payments.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">
                    {Number(p.amount).toLocaleString()} DZD · {p.purpose}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString()} · for {p.for_month}
                    {p.method ? ` · ${p.method}` : ""}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
