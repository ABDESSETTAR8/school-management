import { z } from "zod";

export const STAFF_ROLE_OPTIONS = [
  { value: "teacher", label: "Teacher" },
  { value: "worker", label: "Worker" },
  { value: "admin", label: "Administrator" },
] as const;

const NAME = 60;
const EMAIL = 120;
const SHORT = 60;

export const createStaffSchema = z.object({
  firstName: z.string().min(2, "First name is too short.").max(NAME, "First name is too long."),
  lastName: z.string().min(2, "Last name is too short.").max(NAME, "Last name is too long."),
  email: z.string().email("Enter a valid email address.").max(EMAIL),
  password: z.string().min(8, "Temporary password must be at least 8 characters.").max(72),
  role: z.enum(["teacher", "worker", "admin"]),
  employeeNo: z.string().min(1, "Employee number is required.").max(30, "Employee number is too long."),
  jobTitle: z.string().max(SHORT, "Job title is too long.").optional(),
  department: z.string().max(SHORT, "Department is too long.").optional(),
  hireDate: z.string().min(1, "Hire date is required.").max(10),
});

export const updateStaffSchema = z.object({
  staffId: z.string().uuid(),
  profileId: z.string().uuid(),
  firstName: z.string().min(2, "First name is too short.").max(NAME, "First name is too long."),
  lastName: z.string().min(2, "Last name is too short.").max(NAME, "Last name is too long."),
  role: z.enum(["teacher", "worker", "admin"]),
  employeeNo: z.string().min(1, "Employee number is required.").max(30, "Employee number is too long."),
  jobTitle: z.string().max(SHORT, "Job title is too long.").optional(),
  department: z.string().max(SHORT, "Department is too long.").optional(),
  hireDate: z.string().min(1, "Hire date is required.").max(10),
  isActive: z.coerce.boolean().optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ActionState = { error?: string; success?: string } | null;
