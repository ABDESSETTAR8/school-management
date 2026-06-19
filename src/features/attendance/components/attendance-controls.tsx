"use client";

import { useRouter } from "next/navigation";
import type { ClassSubjectOption } from "@/types/database.types";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function AttendanceControls({
  offerings,
  selectedId,
  date,
}: {
  offerings: ClassSubjectOption[];
  selectedId: string;
  date: string;
}) {
  const router = useRouter();

  function go(cs: string, d: string) {
    router.push(`/dashboard/attendance?cs=${cs}&date=${d}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="cs">Class &amp; subject</Label>
        <select
          id="cs"
          className={selectClass}
          value={selectedId}
          onChange={(e) => go(e.target.value, date)}
        >
          {offerings.map((o) => (
            <option key={o.id} value={o.id}>
              {o.className} — {o.subjectName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <input
          id="date"
          type="date"
          className={selectClass}
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => go(selectedId, e.target.value)}
        />
      </div>
    </div>
  );
}
