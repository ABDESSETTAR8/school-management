"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Server-driven pagination. Builds URLs from a base path + preserved params. */
export function Pagination({
  page,
  pageSize,
  total,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Build the URL for a given page number (preserving other params). */
  makeHref: (page: number) => string;
}) {
  const router = useRouter();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total <= pageSize) {
    return (
      <p className="text-xs text-muted-foreground">
        {total} result{total === 1 ? "" : "s"}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => router.push(makeHref(page - 1))}
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => router.push(makeHref(page + 1))}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
