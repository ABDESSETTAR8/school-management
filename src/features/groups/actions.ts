"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { groupSchema, type ActionState } from "./schema";

const PATH = "/dashboard/groups";

export async function saveGroup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requirePermission("groups");

  const parsed = groupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const supabase = await createClient();
  const row = {
    name: d.name,
    class_id: d.classId && d.classId !== "" ? d.classId : null,
    teacher_id: d.teacherId && d.teacherId !== "" ? d.teacherId : null,
    classroom: d.classroom || null,
    schedule: d.schedule || null,
    capacity: d.capacity,
    monthly_fee: d.monthlyFee,
    is_active: d.isActive ?? true,
  };

  if (d.groupId) {
    const { error } = await supabase.from("groups").update(row).eq("id", d.groupId);
    if (error) return { error: error.message };
    revalidatePath(PATH);
    return { success: "Group updated." };
  }

  const { error } = await supabase.from("groups").insert(row);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { success: "Group created." };
}

export async function deleteGroup(groupId: string): Promise<ActionState> {
  await requirePermission("groups");
  const supabase = await createClient();
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { success: "Group deleted." };
}
