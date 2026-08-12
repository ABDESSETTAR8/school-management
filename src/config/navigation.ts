import type { IconName } from "@/lib/icons";
import type { PermissionKey } from "@/config/permissions";
import type { UserRole } from "@/types/database.types";

export type NavItem = {
  title: string;
  href: string;
  icon: IconName;
  /** If set, a worker only sees this item when granted the permission. */
  perm?: PermissionKey;
};

const ADMIN_NAV: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Students", href: "/dashboard/students", icon: "GraduationCap" },
  { title: "Teachers", href: "/dashboard/teachers", icon: "Presentation" },
  { title: "Workers", href: "/dashboard/staff", icon: "UserCog" },
  { title: "Classes", href: "/dashboard/classes", icon: "Users" },
  { title: "Groups", href: "/dashboard/groups", icon: "Layers" },
  { title: "Subjects", href: "/dashboard/subjects", icon: "BookOpen" },
  { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
  { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

const WORKER_NAV: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Students", href: "/dashboard/students", icon: "GraduationCap", perm: "students" },
  { title: "Teachers", href: "/dashboard/teachers", icon: "Presentation", perm: "teachers" },
  { title: "Classes", href: "/dashboard/classes", icon: "Users", perm: "classes" },
  { title: "Groups", href: "/dashboard/groups", icon: "Layers", perm: "groups" },
  { title: "Subjects", href: "/dashboard/subjects", icon: "BookOpen", perm: "subjects" },
  { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck", perm: "attendance" },
  { title: "Settings", href: "/dashboard/settings", icon: "Settings", perm: "settings" },
];

/** Navigation surface per role. Workers are filtered by their permissions at render. */
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  worker: WORKER_NAV,
  teacher: [{ title: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
  student: [{ title: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
  parent: [{ title: "Overview", href: "/dashboard", icon: "LayoutDashboard" }],
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
