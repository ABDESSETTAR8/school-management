"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { PaymentLedgerRow } from "@/types/database.types";
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
import { ReceiptDialog } from "./receipt-dialog";

const CSV_COLUMNS: CsvColumn<PaymentLedgerRow>[] = [
  { header: "Date", value: (r) => new Date(r.date).toLocaleString() },
  { header: "Type", value: (r) => r.type },
  { header: "Payee", value: (r) => r.payee },
  { header: "Purpose", value: (r) => r.purpose },
  { header: "Method", value: (r) => r.method ?? "" },
  { header: "Amount", value: (r) => r.amount },
];

export function PaymentsTable({
  rows,
  schoolName,
  q,
  page,
  pageSize,
  total,
}: {
  rows: PaymentLedgerRow[];
  schoolName: string;
  q: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  useEffect(() => {
    if (term === q) return;
    const t = setTimeout(() => router.push(`/dashboard/payments?q=${encodeURIComponent(term)}&page=1`), 300);
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
            placeholder="Search payee or purpose…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <ExportButton filename="payments" rows={rows} columns={CSV_COLUMNS} />
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Date</TableHead>
              <TableHead>Payee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    {q ? "No matches." : "No payments recorded yet."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={`${r.type}-${r.id}`}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(r.date).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{r.payee}</TableCell>
                  <TableCell>
                    <Badge variant={r.type === "student" ? "default" : "secondary"} className="capitalize">
                      {r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.purpose}</TableCell>
                  <TableCell className="font-medium">{r.amount.toLocaleString()} DZD</TableCell>
                  <TableCell className="text-right">
                    <ReceiptDialog row={r} schoolName={schoolName} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} baseHref="/dashboard/payments" query={{ q }} />
    </div>
  );
}
