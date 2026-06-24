import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address.").max(120),
  password: z.string().min(1, "Password is required.").max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type AuthState = { error?: string; success?: string } | null;

/** Public, read-only demo accounts surfaced on the login page. */
export const DEMO_PASSWORD = "Password123!";

export const DEMO_ACCOUNTS = [
  { role: "admin", label: "Admin", email: "admin@demo.school", blurb: "Full access" },
  { role: "worker", label: "Worker", email: "worker@demo.school", blurb: "Full access" },
  { role: "teacher", label: "Teacher", email: "teacher@demo.school", blurb: "Classes & attendance" },
  { role: "student", label: "Student", email: "student@demo.school", blurb: "My attendance" },
  { role: "parent", label: "Parent", email: "parent@demo.school", blurb: "Children's attendance" },
] as const;

export const DEMO_EMAILS = DEMO_ACCOUNTS.map((a) => a.email) as readonly string[];
