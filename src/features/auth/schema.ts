import { z } from "zod";

export const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
  { value: "teacher", label: "Teacher" },
  { value: "worker", label: "Worker" },
] as const;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is too short."),
    lastName: z.string().min(2, "Last name is too short."),
    email: z.string().email("Enter a valid email address."),
    role: z.enum(["student", "parent", "teacher", "worker"]),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export type AuthState = { error?: string; success?: string } | null;
