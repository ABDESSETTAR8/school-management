import type { IconName } from "@/lib/icons";
import type { PermissionKey } from "@/config/permissions";
import type { UserRole } from "@/types/database.types";

export type NavItem = {
  key: string;
  title: string;
  href: string;
  icon: IconName;
  /** If set, a worker only sees this item when granted the permission. */
  perm?: PermissionKey;
};

const ADMIN_NAV: NavItem[] = [
  { key: "overview", title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { key: "students", title: "Students", href: "/dashboard/students", icon: "GraduationCap" },
  { key: "billing", title: "Billing", href: "/dashboard/billing", icon: "Wallet" },
  { key: "payments", title: "Payments", href: "/dashboard/payments", icon: "Receipt" },
  { key: "teachers", title: "Teachers", href: "/dashboard/teachers", icon: "Presentation" },
  { key: "workers", title: "Workers", href: "/dashboard/staff", icon: "UserCog" },
  { key: "classes", title: "Classes", href: "/dashboard/classes", icon: "Users" },
  { key: "groups", title: "Groups", href: "/dashboard/groups", icon: "Layers" },
  { key: "subjects", title: "Subjects", href: "/dashboard/subjects", icon: "BookOpen" },
  { key: "attendance", title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
  { key: "settings", title: "Settings", href: "/dashboard/settings", icon: "Settings" },
  { key: "audit", title: "Audit Log", href: "/dashboard/audit", icon: "History" },
];

const WORKER_NAV: NavItem[] = [
  { key: "overview", title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { key: "students", title: "Students", href: "/dashboard/students", icon: "GraduationCap", perm: "students" },
  { key: "billing", title: "Billing", href: "/dashboard/billing", icon: "Wallet", perm: "billing" },
  { key: "payments", title: "Payments", href: "/dashboard/payments", icon: "Receipt", perm: "billing" },
  { key: "teachers", title: "Teachers", href: "/dashboard/teachers", icon: "Presentation", perm: "teachers" },
  { key: "classes", title: "Classes", href: "/dashboard/classes", icon: "Users", perm: "classes" },
  { key: "groups", title: "Groups", href: "/dashboard/groups", icon: "Layers", perm: "groups" },
  { key: "subjects", title: "Subjects", href: "/dashboard/subjects", icon: "BookOpen", perm: "subjects" },
  { key: "attendance", title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck", perm: "attendance" },
  { key: "settings", title: "Settings", href: "/dashboard/settings", icon: "Settings", perm: "settings" },
];

/** Navigation surface per role. Workers are filtered by their permissions at render. */
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  worker: WORKER_NAV,
  teacher: [{ key: "overview", title: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
  student: [{ key: "overview", title: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
  parent: [{ key: "overview", title: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
};

/** Filter a role's nav by the user's granted permissions (admins see all). */
export function navFor(role: UserRole, permissions: string[]): NavItem[] {
  const items = NAV_BY_ROLE[role] ?? [];
  if (role !== "worker") return items;
  return items.filter((i) => !i.perm || permissions.includes(i.perm));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  worker: "Staff",
};
