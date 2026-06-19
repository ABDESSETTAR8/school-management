import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { NAV_BY_ROLE } from "@/config/navigation";
import type { UserRole } from "@/types/database.types";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-6 lg:flex">
      <Link
        href="/dashboard"
        className="mb-8 flex items-center gap-2 px-6 text-lg font-semibold text-sidebar-foreground"
      >
        <GraduationCap className="size-6 text-primary" />
        {siteConfig.name}
      </Link>

      <SidebarNav items={NAV_BY_ROLE[role]} />

      <div className="mt-auto px-6 pt-6">
        <p className="text-xs text-sidebar-foreground/40">
          {siteConfig.name} v0.1
        </p>
      </div>
    </aside>
  );
}
