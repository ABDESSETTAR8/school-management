import { z } from "zod";

export const subjectSchema = z.object({
  subjectId: z.string().uuid().optional(),
  code: z
    .string()
    .min(2, "Code is required.")
    .max(12, "Code is too long.")
    .transform((s) => s.toUpperCase().trim()),
  name: z.string().min(2, "Name is required."),
  description: z.string().optional(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;
export type ActionState = { error?: string; success?: string } | null;
