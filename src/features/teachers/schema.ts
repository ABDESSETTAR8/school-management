import { z } from "zod";

export const teacherSchema = z.object({
  teacherId: z.string().uuid().optional(),
  firstName: z.string().min(1, "First name is required.").max(60, "First name is too long."),
  lastName: z.string().max(60, "Last name is too long.").optional(),
  phone: z.string().max(30, "Phone is too long.").optional(),
  email: z.string().email("Enter a valid email.").max(120).optional().or(z.literal("")),
  subjects: z.string().max(200, "Subjects list is too long.").optional(), // comma-separated
  salary: z.coerce.number().min(0, "Salary can't be negative.").max(10_000_000),
  notes: z.string().max(500).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const paymentSchema = z.object({
  teacherId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than 0.").max(10_000_000),
  paymentDate: z.string().min(1, "Date is required.").max(10),
  method: z.string().max(40).optional(),
  note: z.string().max(200).optional(),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ActionState = { error?: string; success?: string } | null;
