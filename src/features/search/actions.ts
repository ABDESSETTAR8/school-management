"use server";

import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SearchHit = { id: string; label: string; meta: string; href: string };
export type SearchResults = { students: SearchHit[]; teachers: SearchHit[]; groups: SearchHit[] };

const EMPTY: SearchResults = { students: [], teachers: [], groups: [] };

/** Search students, teachers, and groups by name. Staff only. */
export async function globalSearch(query: string): Promise<SearchResults> {
  await requireRole(["admin", "worker"]);
  const q = query.replace(/[%,()]/g, "").trim();
  if (q.length < 2) return EMPTY;

  const supabase = await createClient();
  const like = `%${q}%`;

  const [st, te, gr] = await Promise.all([
    supabase
      .from("students")
      .select("id, first_name, last_name, parent_name")
      .or(`first_name.ilike.${like},last_name.ilike.${like},parent_name.ilike.${like}`)
      .limit(6)
      .returns<{ id: string; first_name: string; last_name: string; parent_name: string | null }[]>(),
    supabase
      .from("teachers")
      .select("id, first_name, last_name")
      .or(`first_name.ilike.${like},last_name.ilike.${like}`)
      .limit(6)
      .returns<{ id: string; first_name: string; last_name: string }[]>(),
    supabase
      .from("groups")
      .select("id, name")
      .ilike("name", like)
      .limit(6)
      .returns<{ id: string; name: string }[]>(),
  ]);

  return {
    students: (st.data ?? []).map((s) => ({
      id: s.id,
      label: `${s.first_name} ${s.last_name}`,
      meta: s.parent_name ? `Parent: ${s.parent_name}` : "Student",
      href: "/dashboard/students",
    })),
    teachers: (te.data ?? []).map((t) => ({
      id: t.id,
      label: `${t.first_name} ${t.last_name}`,
      meta: "Teacher",
      href: "/dashboard/teachers",
    })),
    groups: (gr.data ?? []).map((g) => ({
      id: g.id,
      label: g.name,
      meta: "Group",
      href: "/dashboard/groups",
    })),
  };
}
