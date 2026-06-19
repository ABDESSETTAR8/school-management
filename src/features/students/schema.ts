import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
] as const;

export const createStudentSchema = z.object({
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Temporary password must be at least 8 characters."),
  admissionNo: z.string().min(1, "Admission number is required."),
  admissionDate: z.string().min(1, "Admission date is required."),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  phone: z.string().optional(),
});

export const updateStudentSchema = z.object({
  studentId: z.string().uuid(),
  profileId: z.string().uuid(),
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  admissionNo: z.string().min(1, "Admission number is required."),
  admissionDate: z.string().min(1, "Admission date is required."),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  phone: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export type ActionState = { error?: string; success?: string } | null;
