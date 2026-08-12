export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

/** Serialize rows to a CSV string with proper escaping. */
export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(c.value(r))).join(",")).join("\r\n");
  return `${head}\r\n${body}`;
}

/** Trigger a browser download of a CSV string. Prepends a UTF-8 BOM so
 *  Excel opens Arabic/French text correctly. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
