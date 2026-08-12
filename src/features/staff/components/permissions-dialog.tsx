"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { setWorkerPermissions } from "../actions";
import { PERMISSIONS } from "@/config/permissions";
import type { StaffListItem } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PermissionsDialog({ worker }: { worker: StaffListItem }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(worker.profile.permissions ?? []),
  );
  const [pending, start] = useTransition();
  const { toast } = useToast();

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function save() {
    start(async () => {
      const res = await setWorkerPermissions(worker.profile.id, [...selected]);
      if (res?.error) toast({ title: res.error, variant: "error" });
      else {
        toast({ title: res?.success ?? "Permissions updated.", variant: "success" });
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Permissions">
          <ShieldCheck className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Permissions · {worker.profile.first_name} {worker.profile.last_name}
          </DialogTitle>
          <DialogDescription>
            Choose which sections this worker can access.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {PERMISSIONS.map((p) => {
            const checked = selected.has(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggle(p.key)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  checked ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded border ${
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
                  }`}
                >
                  {checked && <ShieldCheck className="size-3" />}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Save permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
