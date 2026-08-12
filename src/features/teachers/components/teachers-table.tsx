"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Presentation, Search, Trash2 } from "lucide-react";
import { deleteTeacher } from "../actions";
import type { TeacherListItem } from "@/types/database.types";
import type { CsvColumn } from "@/lib/csv";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/export-button";
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
import { TeacherDialog } from "./teacher-dialog";
import { PaymentDialog } from "./payment-dialog";

const DZD = (n: number) => `${n.toLocaleString()} DZD`;

const CSV_COLUMNS: CsvColumn<TeacherListItem>[] = [
  { header: "Name", value: (t) => `${t.first_name} ${t.last_name}` },
  { header: "Phone", value: (t) => t.phone ?? "" },
  { header: "Email", value: (t) => t.email ?? "" },
  { header: "Subjects", value: (t) => t.subjects.join("; ") },
  { header: "Groups", value: (t) => t.groupsCount },
  { header: "Salary", value: (t) => t.salary },
  { header: "Paid This Month", value: (t) => t.paidThisMonth },
  { header: "Remaining", value: (t) => t.remaining },
  { header: "Last Payment", value: (t) => t.lastPaymentDate ?? "" },
  { header: "Status", value: (t) => (t.isActive ? "Active" : "Inactive") },
];

function DeleteButton({ teacher }: { teacher: TeacherListItem }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label="Delete teacher"
      >
        <Trash2 className="size-4" />
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remove {teacher.first_name} {teacher.last_name}?</DialogTitle>
          <DialogDescription>This deletes the teacher and their payment history.</DialogDescription>
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
              start(async () => {
                const r = await deleteTeacher(teacher.id);
                if (r?.error) setError(r.error);
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

export function TeachersTable({ teachers }: { teachers: TeacherListItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)) ||
        (t.phone?.includes(q) ?? false),
    );
  }, [teachers, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teachers…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="teachers" rows={filtered} columns={CSV_COLUMNS} />
          <TeacherDialog
            trigger={
              <Button>
                <Plus className="size-4" /> Add teacher
              </Button>
            }
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Teacher</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <Presentation className="size-8 opacity-40" />
                    <p className="text-sm">{teachers.length === 0 ? "No teachers yet." : "No matches."}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(t.first_name, t.last_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {t.first_name} {t.last_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{t.phone ?? "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-sm">
                    {t.subjects.length ? t.subjects.join(", ") : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{t.groupsCount}</TableCell>
                  <TableCell className="text-sm">{DZD(t.salary)}</TableCell>
                  <TableCell>
                    {t.remaining > 0 ? (
                      <Badge variant="warning">{DZD(t.remaining)}</Badge>
                    ) : (
                      <Badge variant="success">Paid</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <PaymentDialog teacher={t} />
                      <TeacherDialog
                        teacher={t}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit teacher">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteButton teacher={t} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {teachers.length} teacher{teachers.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
