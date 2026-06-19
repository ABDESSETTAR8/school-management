"use client";

import { motion } from "framer-motion";
import { ICONS, type IconName } from "@/lib/icons";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon,
  hint,
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
  index?: number;
}) {
  const Icon = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </motion.div>
  );
}
