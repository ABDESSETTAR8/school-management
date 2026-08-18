import { z } from "zod";

export const studentPaymentSchema = z.object({
  studentId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than 0.").max(10_000_000),
  paidOn: z.string().min(1, "Date is required.").max(10),
  forMonth: z.string().min(7, "Select the month.").max(7), // YYYY-MM
  purpose: z.string().min(1, "Purpose is required.").max(80),
  method: z.string().max(40).optional(),
  note: z.string().max(200).optional(),
});

export type StudentPaymentInput = z.infer<typeof studentPaymentSchema>;
export type ActionState = { error?: string; success?: string } | null;
