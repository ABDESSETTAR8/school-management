import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name is too short.").max(60, "First name is too long."),
  lastName: z.string().min(2, "Last name is too short.").max(60, "Last name is too long."),
  phone: z.string().max(30, "Phone is too long.").optional(),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  dateOfBirth: z.string().max(10).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ActionState = { error?: string; success?: string } | null;
