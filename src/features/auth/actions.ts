"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_EMAILS, DEMO_PASSWORD, loginSchema, type AuthState } from "./schema";

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** One-click login to a public demo account. */
export async function demoLogin(email: string): Promise<AuthState> {
  if (!DEMO_EMAILS.includes(email)) {
    return { error: "Unknown demo account." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: DEMO_PASSWORD,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
