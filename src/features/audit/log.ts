import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Record a sensitive action. Best-effort — never throws into the caller. */
export async function logAudit(action: string, entity: string, detail?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      actor: user?.email ?? "system",
      action,
      entity,
      detail: detail ?? null,
    });
  } catch {
    /* ignore — auditing must not break the primary action */
  }
}
