import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AuditRow = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  detail: string | null;
  created_at: string;
};

export async function getAuditLogs({
  page = 1,
  pageSize = 20,
}: { page?: number; pageSize?: number } = {}): Promise<{ rows: AuditRow[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await supabase
    .from("audit_logs")
    .select("id, actor, action, entity, detail, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<AuditRow[]>();
  if (error) return { rows: [], total: 0 };
  return { rows: data ?? [], total: count ?? 0 };
}
