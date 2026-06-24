import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
] as const;

export const NAME_MAX = 60;
export const EMAIL_MAX = 120;
export const ADMISSION_MAX = 30;
export const PHONE_MAX = 30;
export const PASSWORD_MAX = 72;

export const createStudentSchema = z.object({
  firstName: z.string().min(2, "First name is too short.").max(NAME_MAX, "First name is too long."),
  lastName: z.string().min(2, "Last name is too short.").max(NAME_MAX, "Last name is too long."),
  email: z.string().email("Enter a valid email address.").max(EMAIL_MAX),
  password: z
    .string()
    .min(8, "Temporary password must be at least 8 characters.")
    .max(PASSWORD_MAX, "Password is too long."),
  admissionNo: z.string().min(1, "Admission number is required.").max(ADMISSION_MAX, "Admission number is too long."),
  admissionDate: z.string().min(1, "Admission date is required.").max(10),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  phone: z.string().max(PHONE_MAX, "Phone is too long.").optional(),
});

export const updateStudentSchema = z.object({
  studentId: z.string().uuid(),
  profileId: z.string().uuid(),
  firstName: z.string().min(2, "First name is too short.").max(NAME_MAX, "First name is too long."),
  lastName: z.string().min(2, "Last name is too short.").max(NAME_MAX, "Last name is too long."),
  admissionNo: z.string().min(1, "Admission number is required.").max(ADMISSION_MAX, "Admission number is too long."),
  admissionDate: z.string().min(1, "Admission date is required.").max(10),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  phone: z.string().max(PHONE_MAX, "Phone is too long.").optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export type ActionState = { error?: string; success?: string } | null;
