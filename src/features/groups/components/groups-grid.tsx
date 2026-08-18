"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Loader2, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { deleteGroup } from "../actions";
import type { GroupListItem, TeacherOption } from "@/types/database.types";
import type { CsvColumn } from "@/lib/csv";
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
import { GroupDialog } from "./group-dialog";

const DZD = (n: number) => `${n.toLocaleString()} DZD`;

const CSV_COLUMNS: CsvColumn<GroupListItem>[] = [
  { header: "Group", value: (g) => g.name },
  { header: "Class", value: (g) => g.className ?? "" },
  { header: "Teacher", value: (g) => g.teacherName ?? "" },
  { header: "Classroom", value: (g) => g.classroom ?? "" },
  { header: "Schedule", value: (g) => g.schedule ?? "" },
  { header: "Students", value: (g) => g.studentsCount },
  { header: "Capacity", value: (g) => g.capacity },
  { header: "Monthly Fee", value: (g) => g.monthlyFee },
  { header: "Monthly Revenue", value: (g) => g.revenue },
  { header: "Status", value: (g) => (g.isActive ? "Active" : "Inactive") },
];

function DeleteButton({ group }: { group: GroupListItem }) {
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
        aria-label="Delete group"
      >
        <Trash2 className="size-4" />
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {group.name}?</DialogTitle>
          <DialogDescription>This removes the group. Students are not deleted.</DialogDescription>
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
                const r = await deleteGroup(group.id);
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

export function GroupsGrid({
  groups,
  classes,
  teachers,
}: {
  groups: GroupListItem[];
  classes: { id: string; name: string }[];
  teachers: TeacherOption[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.className?.toLowerCase().includes(q) ?? false) ||
        (g.teacherName?.toLowerCase().includes(q) ?? false),
    );
  }, [groups, query]);

  const totalRevenue = filtered.reduce((sum, g) => sum + g.revenue, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="groups" rows={filtered} columns={CSV_COLUMNS} />
          <GroupDialog
            classes={classes}
            teachers={teachers}
            trigger={
              <Button>
                <Plus className="size-4" /> Add group
              </Button>
            }
          />
        </div>
      </div>

      <Card className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">Total monthly revenue (shown groups)</span>
        <span className="text-lg font-semibold">{DZD(totalRevenue)}</span>
      </Card>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Layers className="size-8 opacity-40" />
          <p className="text-sm">{groups.length === 0 ? "No groups yet." : "No matches."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {g.className ?? "No class"} · {g.teacherName ?? "No teacher"}
                    </p>
                  </div>
                  <Badge variant={g.isActive ? "success" : "secondary"}>
                    {g.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" /> {g.studentsCount}/{g.capacity}
                  </div>
                  <div className="text-right text-muted-foreground">{g.schedule ?? "—"}</div>
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly revenue</p>
                      <p className="text-lg font-semibold">{DZD(g.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{DZD(g.monthlyFee)} / student</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <GroupDialog
                        group={g}
                        classes={classes}
                        teachers={teachers}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit group">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteButton group={g} />
                    </div>
                  </div>
                  <Button asChild variant="link" className="mt-1 h-auto p-0 text-primary">
                    <Link href={`/dashboard/groups/${g.id}`}>
                      Open group <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {groups.length} group{groups.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
