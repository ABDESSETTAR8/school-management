import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name is too short."),
  lastName: z.string().min(2, "Last name is too short."),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other", "undisclosed"]).optional(),
  dateOfBirth: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ActionState = { error?: string; success?: string } | null;
