import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

const NAME = 60;

const base = {
  firstName: z.string().min(1, "First name is required.").max(NAME, "First name is too long."),
  lastName: z.string().max(NAME, "Last name is too long.").optional(),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  dateOfBirth: z.string().max(10).optional(),
  registrationDate: z.string().min(1, "Registration date is required.").max(10),
  classId: z.string().uuid().optional().or(z.literal("")),
  groupId: z.string().uuid().optional().or(z.literal("")),
  parentName: z.string().max(80, "Parent name is too long.").optional(),
  parentPhone: z.string().max(30, "Phone is too long.").optional(),
  address: z.string().max(200, "Address is too long.").optional(),
  notes: z.string().max(500, "Notes are too long.").optional(),
  status: z.enum(["active", "inactive"]).optional(),
};

export const createStudentSchema = z.object(base);
export const updateStudentSchema = z.object({ studentId: z.string().uuid(), ...base });

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type ActionState = { error?: string; success?: string } | null;
