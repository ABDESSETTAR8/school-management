-- =============================================================================
-- School Management System — policy updates
-- Migration: 0003_policy_updates   (idempotent — safe to re-run)
-- =============================================================================
-- Staff (admin/teacher/worker) need to read student & guardian profiles to
-- render rosters. Broaden the profiles SELECT policy from "self or admin"
-- to "self or any staff member".
-- =============================================================================

drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_staff());
