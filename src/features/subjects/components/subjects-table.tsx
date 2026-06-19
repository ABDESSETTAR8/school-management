"use client";

import { useMemo, useState, useTransition } from "react";
import { BookOpen, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteSubject } from "../actions";
import type { Subject } from "@/types/database.types";
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
import { SubjectDialog } from "./subject-dialog";

type Row = Subject & { classCount: number };

function DeleteButton({ subject }: { subject: Row }) {
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
        aria-label="Delete subject"
      >
        <Trash2 className="size-4" />
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {subject.name}?</DialogTitle>
          <DialogDescription>This removes the subject from the catalog.</DialogDescription>
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
                const res = await deleteSubject(subject.id);
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

export function SubjectsTable({ subjects }: { subjects: Row[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <SubjectDialog
          trigger={
            <Button>
              <Plus className="size-4" /> Add subject
            </Button>
          }
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <BookOpen className="size-8 opacity-40" />
                    <p className="text-sm">
                      {subjects.length === 0 ? "No subjects yet." : "No matches."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {s.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {s.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{s.classCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <SubjectDialog
                        subject={s}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit subject">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteButton subject={s} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {subjects.length} subject{subjects.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
