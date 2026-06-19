"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ICONS } from "@/lib/icons";
import type { NavItem } from "@/config/navigation";

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = ICONS[item.icon];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-sidebar-foreground"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/5",
            )}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-lg bg-sidebar-accent/15 ring-1 ring-sidebar-accent/30"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative size-4 shrink-0" />
            <span className="relative">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
