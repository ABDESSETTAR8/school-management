"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Search, Trash2, UserCog } from "lucide-react";
import { deleteStaff } from "../actions";
import type { StaffListItem } from "@/types/database.types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StaffDialog } from "./staff-dialog";

const ROLE_BADGE: Record<string, "default" | "secondary" | "success"> = {
  admin: "default",
  teacher: "success",
  worker: "secondary",
};

function DeleteButton({ profileId, name }: { profileId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label="Delete staff"
      >
        <Trash2 className="size-4" />
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove {name}?</DialogTitle>
          <DialogDescription>
            This permanently deletes the staff account and record. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteStaff(profileId);
                if (res?.error) setError(res.error);
                else setOpen(false);
              })
            }
          >
            {pending && <Loader2 className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StaffTable({ staff }: { staff: StaffListItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) => {
      const name = `${s.profile.first_name} ${s.profile.last_name}`.toLowerCase();
      return (
        name.includes(q) ||
        s.profile.email.toLowerCase().includes(q) ||
        s.employee_no.toLowerCase().includes(q) ||
        (s.department?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [staff, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search staff…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <StaffDialog
          trigger={
            <Button>
              <Plus className="size-4" /> Add staff
            </Button>
          }
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Staff</TableHead>
              <TableHead>Employee no.</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <UserCog className="size-8 opacity-40" />
                    <p className="text-sm">
                      {staff.length === 0 ? "No staff yet." : "No matches."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(s.profile.first_name, s.profile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {s.profile.first_name} {s.profile.last_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{s.profile.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{s.employee_no}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_BADGE[s.profile.role] ?? "secondary"} className="capitalize">
                      {s.profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.department ?? "—"}</TableCell>
                  <TableCell>
                    {s.profile.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <StaffDialog
                        staff={s}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit staff">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteButton
                        profileId={s.profile.id}
                        name={`${s.profile.first_name} ${s.profile.last_name}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {staff.length} staff member{staff.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
