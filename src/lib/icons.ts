import {
  LayoutDashboard,
  Users,
  Users2,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Central icon registry. We pass icon *names* (strings) across the
 * server → client boundary and resolve the component on the client,
 * because React 19 can't serialize component functions as props.
 */
export const ICONS = {
  LayoutDashboard,
  Users,
  Users2,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  UserCog,
  Settings,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;
