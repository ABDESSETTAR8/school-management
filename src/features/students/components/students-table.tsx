"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, UserPlus } from "lucide-react";
import type { StudentListItem } from "@/types/database.types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportButton } from "@/components/ui/export-button";
import type { CsvColumn } from "@/lib/csv";
import { StudentDialog } from "./student-dialog";
import { DeleteStudentButton } from "./delete-student-button";

const CSV_COLUMNS: CsvColumn<StudentListItem>[] = [
  { header: "First Name", value: (s) => s.first_name },
  { header: "Last Name", value: (s) => s.last_name },
  { header: "Class", value: (s) => s.className ?? "" },
  { header: "Group", value: (s) => s.groupName ?? "" },
  { header: "Parent", value: (s) => s.parent_name ?? "" },
  { header: "Phone", value: (s) => s.parent_phone ?? "" },
  { header: "Address", value: (s) => s.address ?? "" },
  { header: "Status", value: (s) => s.status },
  { header: "Registration Date", value: (s) => s.registration_date },
];

const hrefFor = (q: string, page: number) =>
  `/dashboard/students?q=${encodeURIComponent(q)}&page=${page}`;

export function StudentsTable({
  students,
  classes,
  groups,
  q,
  page,
  pageSize,
  total,
}: {
  students: StudentListItem[];
  classes: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  q: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  // Debounced navigation on search change.
  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => router.push(hrefFor(term, 1)), 300);
    return () => clearTimeout(t);
  }, [term, q, router]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search name, parent, phone…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <ExportButton filename="students" rows={students} columns={CSV_COLUMNS} />
          <StudentDialog
            classes={classes}
            groups={groups}
            trigger={
              <Button>
                <Plus className="size-4" /> Register student
              </Button>
            }
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <UserPlus className="size-8 opacity-40" />
                    <p className="text-sm">{q ? "No matches for your search." : "No students yet."}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(s.first_name, s.last_name)}</AvatarFallback>
                      </Avatar>
                      <p className="truncate font-medium">
                        {s.first_name} {s.last_name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.className ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.groupName ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.parent_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{s.parent_phone ?? "—"}</TableCell>
                  <TableCell>
                    {s.status === "active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <StudentDialog
                        student={s}
                        classes={classes}
                        groups={groups}
                        currentClassId={s.class_id}
                        currentGroupId={s.group_id}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit student">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteStudentButton studentId={s.id} name={`${s.first_name} ${s.last_name}`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} makeHref={(p) => hrefFor(q, p)} />
    </div>
  );
}
