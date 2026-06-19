-- =============================================================================
-- School Management System — parent access to linked children
-- Migration: 0004_parent_access   (idempotent — safe to re-run)
-- =============================================================================
-- Lets a parent read the profile rows of their linked children, so names show
-- up in the parent dashboard. (Attendance/enrollment reads are already covered
-- by my_student_ids() in earlier policies.)
-- =============================================================================

-- Profile ids of the current user's children.
create or replace function public.my_children_profile_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.profile_id
  from public.students s
  where s.id in (select public.my_student_ids());
$$;

-- Broaden the profiles SELECT policy: self, any staff, or own children.
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (
    id = auth.uid()
    or public.is_staff()
    or id in (select public.my_children_profile_ids())
  );
