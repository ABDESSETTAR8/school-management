-- =============================================================================
-- School Management System — RLS, helper functions & auth trigger
-- Migration: 0002_rls_policies   (idempotent — safe to re-run)
-- =============================================================================

-- =============================================================================
-- 1. HELPER FUNCTIONS  (SECURITY DEFINER to avoid RLS recursion on profiles)
-- =============================================================================

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'teacher', 'worker')
  );
$$;

create or replace function public.my_student_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select s.id
  from public.students s
  join public.profiles p on p.id = s.profile_id
  where p.id = auth.uid()
  union
  select sg.student_id
  from public.student_guardians sg
  join public.guardians g on g.id = sg.guardian_id
  where g.profile_id = auth.uid();
$$;

-- =============================================================================
-- 2. AUTO-PROVISION PROFILE ON SIGNUP
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- 3. ENABLE RLS ON EVERY TABLE
-- =============================================================================
alter table public.profiles            enable row level security;
alter table public.students            enable row level security;
alter table public.guardians           enable row level security;
alter table public.staff               enable row level security;
alter table public.student_guardians   enable row level security;
alter table public.academic_years      enable row level security;
alter table public.terms               enable row level security;
alter table public.subjects            enable row level security;
alter table public.classes             enable row level security;
alter table public.class_subjects      enable row level security;
alter table public.enrollments         enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records  enable row level security;

-- =============================================================================
-- 4. POLICIES  (drop-then-create so the script is re-runnable)
-- =============================================================================

-- 4.1 profiles ---------------------------------------------------------------
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
  for insert with check (public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete using (public.is_admin());

-- 4.2 students / guardians / staff ------------------------------------------
drop policy if exists students_read on public.students;
create policy students_read on public.students
  for select using (public.is_staff() or profile_id = auth.uid()
                     or id in (select public.my_student_ids()));

drop policy if exists students_admin_write on public.students;
create policy students_admin_write on public.students
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists guardians_read on public.guardians;
create policy guardians_read on public.guardians
  for select using (public.is_staff() or profile_id = auth.uid());

drop policy if exists guardians_admin_write on public.guardians;
create policy guardians_admin_write on public.guardians
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists staff_read on public.staff;
create policy staff_read on public.staff
  for select using (public.is_staff() or profile_id = auth.uid());

drop policy if exists staff_admin_write on public.staff;
create policy staff_admin_write on public.staff
  for all using (public.is_admin()) with check (public.is_admin());

-- 4.3 student_guardians ------------------------------------------------------
drop policy if exists student_guardians_read on public.student_guardians;
create policy student_guardians_read on public.student_guardians
  for select using (
    public.is_staff()
    or student_id in (select public.my_student_ids())
    or guardian_id in (select g.id from public.guardians g where g.profile_id = auth.uid())
  );

drop policy if exists student_guardians_admin_write on public.student_guardians;
create policy student_guardians_admin_write on public.student_guardians
  for all using (public.is_admin()) with check (public.is_admin());

-- 4.4 reference data (academic_years, terms, subjects) -----------------------
drop policy if exists academic_years_read on public.academic_years;
create policy academic_years_read on public.academic_years
  for select using (auth.role() = 'authenticated');

drop policy if exists academic_years_admin_write on public.academic_years;
create policy academic_years_admin_write on public.academic_years
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists terms_read on public.terms;
create policy terms_read on public.terms
  for select using (auth.role() = 'authenticated');

drop policy if exists terms_admin_write on public.terms;
create policy terms_admin_write on public.terms
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists subjects_read on public.subjects;
create policy subjects_read on public.subjects
  for select using (auth.role() = 'authenticated');

drop policy if exists subjects_admin_write on public.subjects;
create policy subjects_admin_write on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

-- 4.5 classes / class_subjects ----------------------------------------------
drop policy if exists classes_read on public.classes;
create policy classes_read on public.classes
  for select using (auth.role() = 'authenticated');

drop policy if exists classes_admin_write on public.classes;
create policy classes_admin_write on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists class_subjects_read on public.class_subjects;
create policy class_subjects_read on public.class_subjects
  for select using (auth.role() = 'authenticated');

drop policy if exists class_subjects_admin_write on public.class_subjects;
create policy class_subjects_admin_write on public.class_subjects
  for all using (public.is_admin()) with check (public.is_admin());

-- 4.6 enrollments ------------------------------------------------------------
drop policy if exists enrollments_read on public.enrollments;
create policy enrollments_read on public.enrollments
  for select using (
    public.is_staff() or student_id in (select public.my_student_ids())
  );

drop policy if exists enrollments_admin_write on public.enrollments;
create policy enrollments_admin_write on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- 4.7 attendance_sessions ----------------------------------------------------
drop policy if exists attendance_sessions_read on public.attendance_sessions;
create policy attendance_sessions_read on public.attendance_sessions
  for select using (public.is_staff());

drop policy if exists attendance_sessions_teacher_write on public.attendance_sessions;
create policy attendance_sessions_teacher_write on public.attendance_sessions
  for all
  using (
    public.is_admin()
    or taken_by in (select st.id from public.staff st where st.profile_id = auth.uid())
  )
  with check (
    public.is_admin()
    or taken_by in (select st.id from public.staff st where st.profile_id = auth.uid())
  );

-- 4.8 attendance_records -----------------------------------------------------
drop policy if exists attendance_records_read on public.attendance_records;
create policy attendance_records_read on public.attendance_records
  for select using (
    public.is_staff() or student_id in (select public.my_student_ids())
  );

drop policy if exists attendance_records_staff_write on public.attendance_records;
create policy attendance_records_staff_write on public.attendance_records
  for all using (public.is_staff()) with check (public.is_staff());
