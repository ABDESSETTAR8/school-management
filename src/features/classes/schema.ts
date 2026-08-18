import { z } from "zod";

export const classSchema = z.object({
  classId: z.string().uuid().optional(), // present on edit
  name: z.string().min(2, "Class name is required.").max(60, "Class name is too long."),
});

export type ClassInput = z.infer<typeof classSchema>;

export type ActionState = { error?: string; success?: string } | null;
