"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "error" | "default";
type ToastItem = { id: number; title: string; description?: string; variant: Variant };
type ToastInput = { title: string; description?: string; variant?: Variant };

const ToastContext = createContext<{ toast: (t: ToastInput) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/** Fire a toast whenever a server-action result carries a success/error message. */
export function useActionToast(state: { success?: string; error?: string } | null) {
  const { toast } = useToast();
  useEffect(() => {
    if (state?.success) toast({ title: state.success, variant: "success" });
    else if (state?.error) toast({ title: state.error, variant: "error" });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  default: Info,
} as const;

const ACCENT = {
  success: "text-success",
  error: "text-destructive",
  default: "text-primary",
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default" }: ToastInput) => {
      const id = Date.now() + Math.random();
      setToasts((p) => [...p, { id, title, description, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-lg"
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", ACCENT[t.variant])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-card-foreground">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
