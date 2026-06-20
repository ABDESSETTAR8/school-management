"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { subjectSchema, type ActionState } from "./schema";

const PATH = "/dashboard/subjects";

export async function saveSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(["admin", "worker"]);

  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;
  const supabase = await createClient();

  if (d.subjectId) {
    const { error } = await supabase
      .from("subjects")
      .update({ code: d.code, name: d.name, description: d.description || null })
      .eq("id", d.subjectId);
    if (error) return { error: error.message };
    revalidatePath(PATH);
    return { success: "Subject updated." };
  }

  const { error } = await supabase
    .from("subjects")
    .insert({ code: d.code, name: d.name, description: d.description || null });
  if (error) {
    return { error: error.code === "23505" ? "That subject code already exists." : error.message };
  }
  revalidatePath(PATH);
  return { success: "Subject created." };
}

export async function deleteSubject(subjectId: string): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Can't delete: this subject is assigned to one or more classes."
          : error.message,
    };
  }
  revalidatePath(PATH);
  return { success: "Subject deleted." };
}
