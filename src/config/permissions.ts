/** Sections a worker's access can be toggled for. Admins always have all. */
export const PERMISSIONS = [
  { key: "students", label: "Students" },
  { key: "billing", label: "Billing" },
  { key: "teachers", label: "Teachers" },
  { key: "classes", label: "Classes" },
  { key: "groups", label: "Groups" },
  { key: "subjects", label: "Subjects" },
  { key: "attendance", label: "Attendance" },
  { key: "settings", label: "Settings" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key) as readonly PermissionKey[];
