import { z } from "zod";

export const yearSchema = z
  .object({
    name: z.string().min(4, "Name is required (e.g. 2026–2027).").max(40, "Name is too long."),
    startDate: z.string().min(1, "Start date is required.").max(10),
    endDate: z.string().min(1, "End date is required.").max(10),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

export const termSchema = z
  .object({
    academicYearId: z.string().uuid(),
    name: z.string().min(2, "Term name is required.").max(40, "Term name is too long."),
    kind: z.enum(["semester", "trimester", "quarter"]),
    startDate: z.string().min(1, "Start date is required.").max(10),
    endDate: z.string().min(1, "End date is required.").max(10),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

export type YearInput = z.infer<typeof yearSchema>;
export type TermInput = z.infer<typeof termSchema>;
export type ActionState = { error?: string; success?: string } | null;
