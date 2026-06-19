"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, UserPlus } from "lucide-react";
import type { StudentListItem } from "@/types/database.types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentDialog } from "./student-dialog";
import { DeleteStudentButton } from "./delete-student-button";

export function StudentsTable({ students }: { students: StudentListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = `${s.profile.first_name} ${s.profile.last_name}`.toLowerCase();
      return (
        name.includes(q) ||
        s.profile.email.toLowerCase().includes(q) ||
        s.admission_no.toLowerCase().includes(q) ||
        (s.currentClass?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [students, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <StudentDialog
          trigger={
            <Button>
              <Plus className="size-4" /> Add student
            </Button>
          }
        />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead>Admission no.</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <UserPlus className="size-8 opacity-40" />
                    <p className="text-sm">
                      {students.length === 0 ? "No students yet." : "No matches for your search."}
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
                  <TableCell className="font-mono text-sm">{s.admission_no}</TableCell>
                  <TableCell>
                    {s.currentClass ? (
                      <span className="text-sm">{s.currentClass.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.profile.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <StudentDialog
                        student={s}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit student">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteStudentButton
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
        {filtered.length} of {students.length} student{students.length === 1 ? "" : "s"}
      </p>
    </div>
  );
}
