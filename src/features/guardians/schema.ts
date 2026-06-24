import { z } from "zod";

export const RELATIONSHIP_OPTIONS = [
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
] as const;

export const createGuardianSchema = z.object({
  firstName: z.string().min(2, "First name is too short.").max(60, "First name is too long."),
  lastName: z.string().min(2, "Last name is too short.").max(60, "Last name is too long."),
  email: z.string().email("Enter a valid email address.").max(120),
  password: z.string().min(8, "Temporary password must be at least 8 characters.").max(72),
  occupation: z.string().max(60, "Occupation is too long.").optional(),
});

export const linkChildSchema = z.object({
  guardianId: z.string().uuid(),
  studentId: z.string().uuid(),
  relationship: z.enum(["mother", "father", "guardian", "other"]),
});

export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;
export type LinkChildInput = z.infer<typeof linkChildSchema>;
export type ActionState = { error?: string; success?: string } | null;
