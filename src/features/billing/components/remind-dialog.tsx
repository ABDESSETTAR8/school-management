"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import type { BillingRow } from "@/types/database.types";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { NotifyButtons } from "@/components/ui/notify-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RemindDialog({ row }: { row: BillingRow }) {
  const [open, setOpen] = useState(false);
  const due = Math.max(0, row.monthlyFee - row.paidThisMonth);
  const message = `Dear parent, this is a reminder that the monthly fee for ${row.name} (${due.toLocaleString()} DZD) is still due. Thank you. — ${siteConfig.name}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Send reminder" className="text-warning-foreground">
          <Bell className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment reminder · {row.name}</DialogTitle>
          <DialogDescription>Send the parent a reminder about the outstanding fee.</DialogDescription>
        </DialogHeader>
        <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">{message}</p>
        <NotifyButtons phone={row.parentPhone} message={message} />
      </DialogContent>
    </Dialog>
  );
}
