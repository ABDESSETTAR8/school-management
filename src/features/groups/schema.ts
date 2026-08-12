import { z } from "zod";

export const groupSchema = z.object({
  groupId: z.string().uuid().optional(), // present on edit
  name: z.string().min(2, "Group name is required.").max(60, "Group name is too long."),
  classId: z.string().uuid().optional().or(z.literal("")),
  teacherId: z.string().uuid().optional().or(z.literal("")),
  classroom: z.string().max(40, "Classroom is too long.").optional(),
  schedule: z.string().max(120, "Schedule is too long.").optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1.").max(500),
  monthlyFee: z.coerce.number().min(0, "Fee can't be negative.").max(1_000_000),
  isActive: z.coerce.boolean().optional(),
});

export type GroupInput = z.infer<typeof groupSchema>;
export type ActionState = { error?: string; success?: string } | null;
