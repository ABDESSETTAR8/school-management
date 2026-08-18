"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet } from "lucide-react";
import type { BillingRow } from "@/types/database.types";
import type { CsvColumn } from "@/lib/csv";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExportButton } from "@/components/ui/export-button";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayDialog } from "./pay-dialog";
import { HistoryDialog } from "./history-dialog";
import { RemindDialog } from "./remind-dialog";

const DZD = (n: number) => `${n.toLocaleString()} DZD`;

const CSV_COLUMNS: CsvColumn<BillingRow>[] = [
  { header: "Student", value: (r) => r.name },
  { header: "Group", value: (r) => r.groupName ?? "" },
  { header: "Monthly Fee", value: (r) => r.monthlyFee },
  { header: "Paid This Month", value: (r) => r.paidThisMonth },
  { header: "Status", value: (r) => r.status },
  { header: "Parent", value: (r) => r.parentName ?? "" },
  { header: "Phone", value: (r) => r.parentPhone ?? "" },
];

const STATUS: Record<BillingRow["status"], { label: string; variant: "success" | "warning" | "destructive" }> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  unpaid: { label: "Unpaid", variant: "destructive" },
};

export function BillingTable({
  rows,
  q,
  page,
  pageSize,
  total,
}: {
  rows: BillingRow[];
  q: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(
      () => router.push(`/dashboard/billing?q=${encodeURIComponent(term)}&page=1`),
      300,
    );
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
            placeholder="Search student or parent…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <ExportButton filename="billing" rows={rows} columns={CSV_COLUMNS} />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Student</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Paid (month)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                    <Wallet className="size-8 opacity-40" />
                    <p className="text-sm">{q ? "No matches." : "No students yet."}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-sm">{r.groupName ?? "—"}</TableCell>
                  <TableCell className="text-sm">{DZD(r.monthlyFee)}</TableCell>
                  <TableCell className="text-sm">{DZD(r.paidThisMonth)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <PayDialog row={r} />
                      <HistoryDialog row={r} />
                      {r.status !== "paid" && <RemindDialog row={r} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} baseHref="/dashboard/billing" query={{ q }} />
    </div>
  );
}
