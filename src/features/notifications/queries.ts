import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/database.types";

export async function getNotifications(limit = 30): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Notification[]>();
  if (error) return [];
  return data ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
}
