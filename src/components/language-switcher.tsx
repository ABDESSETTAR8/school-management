"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Languages } from "lucide-react";
import { setLocale } from "@/i18n/actions";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function choose(locale: Locale) {
    if (locale === current) return;
    start(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Languages className="size-4" />
        {pending && <Loader2 className="size-3.5 animate-spin" />}
      </div>
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border p-1">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            disabled={pending}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60",
              l === current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
