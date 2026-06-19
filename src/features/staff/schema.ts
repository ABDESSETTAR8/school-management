import { z } from "zod";

export const STAFF_ROLE_OPTIONS = [
  { value: "teacher", label: "Teacher" },
  { value: "worker", label: "Worker" },
  { value: "admin", label: "Administrator" },
] as const;

export const createStaffSchema = z.object({
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Temporary password must be at least 8 characters."),
  role: z.enum(["teacher", "worker", "admin"]),
  employeeNo: z.string().min(1, "Employee number is required."),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required."),
});

export const updateStaffSchema = z.object({
  staffId: z.string().uuid(),
  profileId: z.string().uuid(),
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  role: z.enum(["teacher", "worker", "admin"]),
  employeeNo: z.string().min(1, "Employee number is required."),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required."),
  isActive: z.coerce.boolean().optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ActionState = { error?: string; success?: string } | null;
