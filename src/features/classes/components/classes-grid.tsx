"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Pencil, Plus, Search, Users } from "lucide-react";
import type { ClassListItem, TeacherOption } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassDialog } from "./class-dialog";
import { DeleteClassButton } from "./delete-class-button";

export function ClassesGrid({
  classes,
  teachers,
}: {
  classes: ClassListItem[];
  teachers: TeacherOption[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        String(c.grade_level).includes(q) ||
        (c.homeroomTeacher?.toLowerCase().includes(q) ?? false),
    );
  }, [classes, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classes…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <ClassDialog
          teachers={teachers}
          trigger={
            <Button>
              <Plus className="size-4" /> Add class
            </Button>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Users className="size-8 opacity-40" />
          <p className="text-sm">{classes.length === 0 ? "No classes yet." : "No matches."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => {
            const full = c.enrolledCount >= c.capacity;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="group flex h-full flex-col p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">Grade {c.grade_level}</p>
                    </div>
                    <Badge variant={full ? "warning" : "secondary"}>
                      {c.enrolledCount}/{c.capacity}
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Homeroom: {c.homeroomTeacher ?? "Unassigned"}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <Button asChild variant="link" className="h-auto p-0 text-primary">
                      <Link href={`/dashboard/classes/${c.id}`}>
                        Manage <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                    <div className="flex items-center gap-1">
                      <ClassDialog
                        teachers={teachers}
                        cls={c}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit class">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteClassButton classId={c.id} name={c.name} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {classes.length} class{classes.length === 1 ? "" : "es"}
      </p>
    </div>
  );
}
