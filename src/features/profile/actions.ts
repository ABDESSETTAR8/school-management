"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ActionState } from "./schema";

export async function updateMyProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { id } = await requireUser();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  // RLS lets a user update only their own profile.
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: d.firstName,
      last_name: d.lastName,
      phone: d.phone || null,
      gender: d.gender ?? null,
      date_of_birth: d.dateOfBirth || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout");
  return { success: "Profile updated." };
}
