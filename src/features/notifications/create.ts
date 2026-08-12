import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Insert a notification. Best-effort — never throws into the calling action. */
export async function createNotification(type: string, title: string, body?: string) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").insert({ type, title, body: body ?? null });
  } catch {
    /* ignore — a failed notification must not break the primary action */
  }
}
