"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GraduationCap, Layers, Loader2, Presentation, Search } from "lucide-react";
import { globalSearch, type SearchResults } from "@/features/search/actions";

const GROUPS = [
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "teachers", label: "Teachers", icon: Presentation },
  { key: "groups", label: "Groups", icon: Layers },
] as const;

export function SearchCommand() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await globalSearch(q);
      setResults(r);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const total = results
    ? results.students.length + results.teachers.length + results.groups.length
    : 0;

  return (
    <div ref={boxRef} className="relative hidden max-w-sm flex-1 md:block">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search students, teachers, groups…"
          className="h-9 w-full rounded-md border border-input bg-muted/40 pl-9 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {loading && (
          <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {!results || total === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {loading ? "Searching…" : "No results."}
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto py-1">
              {GROUPS.map((g) => {
                const hits = results[g.key];
                if (hits.length === 0) return null;
                return (
                  <div key={g.key}>
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.label}
                    </p>
                    {hits.map((h) => (
                      <Link
                        key={h.id}
                        href={h.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent"
                      >
                        <g.icon className="size-4 text-muted-foreground" />
                        <span className="flex-1 truncate font-medium">{h.label}</span>
                        <span className="truncate text-xs text-muted-foreground">{h.meta}</span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
