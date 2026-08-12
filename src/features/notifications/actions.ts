"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: string } | null;

export async function markAllRead(): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
  return { success: "All marked as read." };
}

export async function markRead(id: string): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
  return { success: "Marked as read." };
}

export async function clearAll(): Promise<ActionState> {
  await requireRole(["admin", "worker"]);
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) return { error: error.message };
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard", "layout");
  return { success: "Notifications cleared." };
}
