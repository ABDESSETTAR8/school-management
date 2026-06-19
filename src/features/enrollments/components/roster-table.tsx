"use client";

import { useState, useTransition } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { removeEnrollment } from "../actions";
import type { EnrolledStudent } from "@/types/database.types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function RemoveButton({ enrollmentId, classId }: { enrollmentId: string; classId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-destructive"
      aria-label="Remove from class"
      disabled={pending}
      onClick={() => startTransition(() => void removeEnrollment(enrollmentId, classId))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
    </Button>
  );
}

export function RosterTable({
  students,
  classId,
}: {
  students: EnrolledStudent[];
  classId: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = students.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.admission_no.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
        <UserPlus className="size-8 opacity-40" />
        <p className="text-sm">No students enrolled yet. Use “Enroll students” to add some.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search roster…"
        className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Student</TableHead>
            <TableHead>Admission no.</TableHead>
            <TableHead>Enrolled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.enrollmentId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(s.first_name, s.last_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {s.first_name} {s.last_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{s.admission_no}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(s.enrolled_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <RemoveButton enrollmentId={s.enrollmentId} classId={classId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
