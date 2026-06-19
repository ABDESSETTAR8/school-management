import { z } from "zod";

export const classSchema = z.object({
  classId: z.string().uuid().optional(), // present on edit
  name: z.string().min(2, "Class name is required."),
  gradeLevel: z.coerce.number().int().min(1, "Grade level is required.").max(13),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1.").max(200),
  homeroomTeacherId: z.string().uuid().optional().or(z.literal("")),
});

export type ClassInput = z.infer<typeof classSchema>;

export type ActionState = { error?: string; success?: string } | null;
