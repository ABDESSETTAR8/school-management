"use client";

import { useRouter } from "next/navigation";
import type { AttendanceGroupOption } from "../queries";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function AttendanceControls({
  groups,
  selectedId,
  date,
}: {
  groups: AttendanceGroupOption[];
  selectedId: string;
  date: string;
}) {
  const router = useRouter();

  function go(grp: string, d: string) {
    router.push(`/dashboard/attendance?grp=${grp}&date=${d}`);
  }

  return (
    <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="grp">Group</Label>
        <select
          id="grp"
          className={selectClass}
          value={selectedId}
          onChange={(e) => go(e.target.value, date)}
        >
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
              {g.className ? ` — ${g.className}` : ""}
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
