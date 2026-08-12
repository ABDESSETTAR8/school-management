import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navFor } from "@/config/navigation";
import { getI18n } from "@/i18n/server";
import type { UserRole } from "@/types/database.types";
import { SidebarNav } from "./sidebar-nav";

export async function Sidebar({ role, permissions }: { role: UserRole; permissions: string[] }) {
  const { dict } = await getI18n();
  const items = navFor(role, permissions).map((i) => ({
    ...i,
    title: dict.nav[i.key] ?? i.title,
  }));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-6 lg:flex">
      <Link
        href="/dashboard"
        className="mb-8 flex items-center gap-2 px-6 text-lg font-semibold text-sidebar-foreground"
      >
        <GraduationCap className="size-6 text-primary" />
        {siteConfig.name}
      </Link>

      <SidebarNav items={items} />

      <div className="mt-auto px-6 pt-6">
        <p className="text-xs text-sidebar-foreground/40">{siteConfig.name} v0.1</p>
      </div>
    </aside>
  );
}
