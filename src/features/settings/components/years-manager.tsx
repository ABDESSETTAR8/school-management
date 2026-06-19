"use client";

import { useState, useTransition } from "react";
import { CalendarRange, CheckCircle2, Loader2, Trash2, X } from "lucide-react";
import { deleteTerm, deleteYear, setCurrentYear } from "../actions";
import type { AcademicYearWithTerms } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { YearDialog } from "./year-dialog";
import { TermDialog } from "./term-dialog";

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function YearActions({ year }: { year: AcademicYearWithTerms }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      {year.is_current ? (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="size-3" /> Current
        </Badge>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await setCurrentYear(year.id);
              if (r?.error) setError(r.error);
            })
          }
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Set current
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        disabled={pending || year.is_current}
        aria-label="Delete year"
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await deleteYear(year.id);
            if (r?.error) setError(r.error);
          })
        }
      >
        <Trash2 className="size-4" />
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

function TermChip({ termId, label }: { termId: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs">
      {label}
      <button
        type="button"
        aria-label="Delete term"
        className="text-muted-foreground hover:text-destructive disabled:opacity-50"
        disabled={pending}
        onClick={() => start(() => void deleteTerm(termId))}
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
      </button>
    </span>
  );
}

export function YearsManager({ years }: { years: AcademicYearWithTerms[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {years.length} academic year{years.length === 1 ? "" : "s"}
        </h2>
        <YearDialog />
      </div>

      {years.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <CalendarRange className="size-8 opacity-40" />
          <p className="text-sm">No academic years yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {years.map((y) => (
            <Card key={y.id}>
              <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
                <div>
                  <h3 className="font-semibold">{y.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {fmt(y.start_date)} – {fmt(y.end_date)}
                  </p>
                </div>
                <YearActions year={y} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {y.terms.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No terms yet.</span>
                  ) : (
                    y.terms.map((t) => (
                      <TermChip key={t.id} termId={t.id} label={`${t.name} · ${t.kind}`} />
                    ))
                  )}
                </div>
                <TermDialog yearId={y.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
