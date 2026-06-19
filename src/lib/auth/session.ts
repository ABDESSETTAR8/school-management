import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database.types";

/** Returns the current auth user + profile, or null if signed out. */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string | undefined;
  profile: Profile | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { id: user.id, email: user.email, profile: profile ?? null };
}

/** Require a signed-in user with a profile; redirect to /login otherwise. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.profile) redirect("/login?error=no_profile");
  return { ...user, profile: user.profile };
}

/** Require one of the allowed roles; redirect to /dashboard if not permitted. */
export async function requireRole(allowed: UserRole[]) {
  const user = await requireUser();
  if (!allowed.includes(user.profile.role)) redirect("/dashboard");
  return user;
}
