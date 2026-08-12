"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv, rowsToCsv, type CsvColumn } from "@/lib/csv";

/** Reusable "Export CSV" button. Serializes the given rows and downloads them. */
export function ExportButton<T>({
  filename,
  rows,
  columns,
  label = "Export CSV",
}: {
  filename: string;
  rows: T[];
  columns: CsvColumn<T>[];
  label?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={rows.length === 0}
      onClick={() => downloadCsv(filename, rowsToCsv(rows, columns))}
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
}
