import type { IconName } from "@/lib/icons";
import type { UserRole } from "@/types/database.types";

export type NavItem = {
  title: string;
  href: string;
  icon: IconName;
};

/** Navigation surface per role. Drives the sidebar with no scattered conditionals. */
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Students", href: "/dashboard/students", icon: "GraduationCap" },
    { title: "Teachers", href: "/dashboard/teachers", icon: "Presentation" },
    { title: "Workers", href: "/dashboard/staff", icon: "UserCog" },
    { title: "Classes", href: "/dashboard/classes", icon: "Users" },
    { title: "Groups", href: "/dashboard/groups", icon: "Layers" },
    { title: "Subjects", href: "/dashboard/subjects", icon: "BookOpen" },
    { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
    { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
  ],
  teacher: [
    { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "My Classes", href: "/dashboard/classes", icon: "Users" },
    { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
  ],
  student: [
    { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "My Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
  ],
  parent: [
    { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
  ],
  // Workers are full-access administrators (same surface as admin).
  worker: [
    { title: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Students", href: "/dashboard/students", icon: "GraduationCap" },
    { title: "Teachers", href: "/dashboard/teachers", icon: "Presentation" },
    { title: "Workers", href: "/dashboard/staff", icon: "UserCog" },
    { title: "Classes", href: "/dashboard/classes", icon: "Users" },
    { title: "Groups", href: "/dashboard/groups", icon: "Layers" },
    { title: "Subjects", href: "/dashboard/subjects", icon: "BookOpen" },
    { title: "Attendance", href: "/dashboard/attendance", icon: "CalendarCheck" },
    { title: "Settings", href: "/dashboard/settings", icon: "Settings" },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  worker: "Staff",
};
