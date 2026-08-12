-- =============================================================================
-- School Management System — students become data-only records (Phase 1)
-- Migration: 0007_students_data_only   (idempotent — safe to re-run)
-- =============================================================================
-- Students & parents no longer have login accounts. Student names + parent
-- contact info now live directly on the students table. Existing data is
-- migrated in-place. The Parents (guardians) module and the class-enrollment
-- join table are removed; a student now belongs to a class/group directly.
-- =============================================================================

-- 1. New columns on students --------------------------------------------------
alter table public.students add column if not exists first_name text;
alter table public.students add column if not exists last_name text;
alter table public.students add column if not exists gender gender;
alter table public.students add column if not exists date_of_birth date;
alter table public.students add column if not exists registration_date date not null default current_date;
alter table public.students add column if not exists class_id uuid references public.classes (id) on delete set null;
alter table public.students add column if not exists parent_name text;
alter table public.students add column if not exists parent_phone text;
alter table public.students add column if not exists address text;
alter table public.students add column if not exists notes text;
alter table public.students add column if not exists status text not null default 'active';

-- 2. Backfill from the old profile link + enrollments -------------------------
update public.students s set
  first_name = coalesce(s.first_name, p.first_name),
  last_name  = coalesce(s.last_name, p.last_name),
  gender     = coalesce(s.gender, p.gender),
  date_of_birth = coalesce(s.date_of_birth, p.date_of_birth),
  parent_phone  = coalesce(s.parent_phone, p.phone),
  status     = case when p.is_active then 'active' else 'inactive' end
from public.profiles p
where p.id = s.profile_id;

update public.students set registration_date = admission_date
where admission_date is not null;

update public.students s set class_id = e.class_id
from public.enrollments e
where e.student_id = s.id and e.status = 'active' and s.class_id is null;

-- ensure names are never null going forward
update public.students set first_name = coalesce(first_name, 'Student') where first_name is null;
update public.students set last_name  = coalesce(last_name, '') where last_name is null;
alter table public.students alter column first_name set not null;
alter table public.students alter column last_name set not null;

-- 3. Sever the auth-account requirement --------------------------------------
alter table public.students alter column profile_id drop not null;

create index if not exists idx_students_class on public.students (class_id);

-- 4. Remove the Parents (guardians) module + enrollment join ------------------
drop table if exists public.student_guardians cascade;
drop table if exists public.guardians cascade;
drop table if exists public.enrollments cascade;

-- 5. RLS: staff (admin + worker + teacher) manage students -------------------
drop policy if exists students_read on public.students;
create policy students_read on public.students
  for select using (public.is_staff());

drop policy if exists students_admin_write on public.students;
create policy students_admin_write on public.students
  for all using (public.is_admin()) with check (public.is_admin());
