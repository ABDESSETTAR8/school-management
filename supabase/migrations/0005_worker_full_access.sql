-- =============================================================================
-- School Management System — grant workers full (admin-level) access
-- Migration: 0005_worker_full_access   (idempotent — safe to re-run)
-- =============================================================================
-- Business rule: the 'worker' role is a full administrator. Rather than rewrite
-- every policy, we widen is_admin() to treat workers as admins. All existing
-- admin-gated write policies (which call is_admin()) then apply to workers too.
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'worker')
  );
$$;
