-- Combined pending migrations (0006–0012). Idempotent — safe to run once.

-- ===== 0006_groups_and_foundation.sql =====
-- =============================================================================
-- School Management System — v2 foundation (Phase 1, step 1)
-- Migration: 0006_groups_and_foundation   (idempotent — safe to re-run)
-- =============================================================================
-- Additive only: adds the Groups module, a students.group_id link, and a
-- worker permissions column. Nothing is dropped here — the destructive
-- students/parents refactor happens in a later, dedicated migration.
-- =============================================================================

-- Worker permissions (empty = no access; admins bypass this) ------------------
alter table public.profiles
  add column if not exists permissions text[] not null default '{}';

-- Groups ----------------------------------------------------------------------
create table if not exists public.groups (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  class_id     uuid references public.classes (id) on delete set null,
  teacher_id   uuid references public.staff (id) on delete set null,
  classroom    text,
  schedule     text,
  capacity     int  not null default 20,
  monthly_fee  numeric(10, 2) not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (capacity > 0),
  check (monthly_fee >= 0)
);

create index if not exists idx_groups_class on public.groups (class_id);
create index if not exists idx_groups_teacher on public.groups (teacher_id);

drop trigger if exists trg_groups_updated_at on public.groups;
create trigger trg_groups_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

-- Link students to a group (nullable; populated by the student refactor) -------
alter table public.students
  add column if not exists group_id uuid references public.groups (id) on delete set null;

create index if not exists idx_students_group on public.students (group_id);

-- RLS -------------------------------------------------------------------------
alter table public.groups enable row level security;

drop policy if exists groups_read on public.groups;
create policy groups_read on public.groups
  for select using (auth.role() = 'authenticated');

drop policy if exists groups_admin_write on public.groups;
create policy groups_admin_write on public.groups
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== 0007_students_data_only.sql =====
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

-- ===== 0008_teachers_and_payments.sql =====
-- =============================================================================
-- School Management System — Teachers (data-only) + payments (Phase 1)
-- Migration: 0008_teachers_and_payments   (idempotent — safe to re-run)
-- =============================================================================
-- Teachers are data records (no login accounts). Adds teacher_payments and
-- repoints groups.teacher_id at the new teachers table.
-- =============================================================================

create table if not exists public.teachers (
  id          uuid primary key default uuid_generate_v4(),
  first_name  text not null,
  last_name   text not null default '',
  phone       text,
  email       text,
  subjects    text[] not null default '{}',
  salary      numeric(10, 2) not null default 0,
  notes       text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (salary >= 0)
);

drop trigger if exists trg_teachers_updated_at on public.teachers;
create trigger trg_teachers_updated_at
  before update on public.teachers
  for each row execute function public.set_updated_at();

create table if not exists public.teacher_payments (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references public.teachers (id) on delete cascade,
  amount        numeric(10, 2) not null,
  payment_date  date not null default current_date,
  method        text,
  note          text,
  created_at    timestamptz not null default now(),
  check (amount > 0)
);

create index if not exists idx_teacher_payments_teacher on public.teacher_payments (teacher_id);
create index if not exists idx_teacher_payments_date on public.teacher_payments (payment_date);

-- Repoint groups.teacher_id from staff → teachers (old refs cleared) ----------
alter table public.groups drop constraint if exists groups_teacher_id_fkey;
update public.groups set teacher_id = null;
alter table public.groups
  add constraint groups_teacher_id_fkey
  foreign key (teacher_id) references public.teachers (id) on delete set null;

-- RLS -------------------------------------------------------------------------
alter table public.teachers enable row level security;
alter table public.teacher_payments enable row level security;

drop policy if exists teachers_read on public.teachers;
create policy teachers_read on public.teachers
  for select using (public.is_staff());

drop policy if exists teachers_write on public.teachers;
create policy teachers_write on public.teachers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists teacher_payments_read on public.teacher_payments;
create policy teacher_payments_read on public.teacher_payments
  for select using (public.is_staff());

drop policy if exists teacher_payments_write on public.teacher_payments;
create policy teacher_payments_write on public.teacher_payments
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== 0009_group_attendance.sql =====
-- =============================================================================
-- School Management System — attendance by group (Phase 1)
-- Migration: 0009_group_attendance   (idempotent — safe to re-run)
-- =============================================================================
-- Replaces the old class-subject-based attendance with a simple per-group,
-- per-day, per-student model.
-- =============================================================================

create table if not exists public.attendance (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  student_id  uuid not null references public.students (id) on delete cascade,
  date        date not null default current_date,
  status      attendance_status not null default 'present',
  created_at  timestamptz not null default now(),
  unique (group_id, student_id, date)
);

create index if not exists idx_attendance_group_date on public.attendance (group_id, date);
create index if not exists idx_attendance_student on public.attendance (student_id);

-- Remove the old class-subject attendance tables ------------------------------
drop table if exists public.attendance_records cascade;
drop table if exists public.attendance_sessions cascade;
drop table if exists public.class_subjects cascade;

-- RLS -------------------------------------------------------------------------
alter table public.attendance enable row level security;

drop policy if exists attendance_read on public.attendance;
create policy attendance_read on public.attendance
  for select using (public.is_staff());

drop policy if exists attendance_write on public.attendance;
create policy attendance_write on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== 0010_school_settings.sql =====
-- =============================================================================
-- School Management System — school settings (Phase 2)
-- Migration: 0010_school_settings   (idempotent — safe to re-run)
-- =============================================================================
-- A single-row table holding school-wide configuration.
-- =============================================================================

create table if not exists public.school_settings (
  id          boolean primary key default true,
  school_name text not null default 'My School',
  email       text,
  phone       text,
  address     text,
  logo_url    text,
  updated_at  timestamptz not null default now(),
  constraint school_settings_singleton check (id)
);

insert into public.school_settings (id) values (true)
on conflict (id) do nothing;

drop trigger if exists trg_school_settings_updated_at on public.school_settings;
create trigger trg_school_settings_updated_at
  before update on public.school_settings
  for each row execute function public.set_updated_at();

alter table public.school_settings enable row level security;

drop policy if exists school_settings_read on public.school_settings;
create policy school_settings_read on public.school_settings
  for select using (auth.role() = 'authenticated');

drop policy if exists school_settings_write on public.school_settings;
create policy school_settings_write on public.school_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== 0011_notifications.sql =====
-- =============================================================================
-- School Management System — notifications center (Phase 2)
-- Migration: 0011_notifications   (idempotent — safe to re-run)
-- =============================================================================
-- A shared staff notification feed (new student, payment, attendance, etc.).
-- =============================================================================

create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null default 'info',
  title       text not null,
  body        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_created on public.notifications (created_at desc);
create index if not exists idx_notifications_unread on public.notifications (is_read) where not is_read;

alter table public.notifications enable row level security;

drop policy if exists notifications_all on public.notifications;
create policy notifications_all on public.notifications
  for all using (public.is_staff()) with check (public.is_staff());

-- ===== 0012_audit_logs.sql =====
-- =============================================================================
-- School Management System — audit logs (Phase 3, security)
-- Migration: 0012_audit_logs   (idempotent — safe to re-run)
-- =============================================================================
-- Immutable record of sensitive administrative actions. Any staff member can
-- write (their own actions), but only admins can read the log.
-- =============================================================================

create table if not exists public.audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  actor       text not null default 'system',
  action      text not null,
  entity      text not null,
  detail      text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_created on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs
  for insert with check (public.is_staff());

drop policy if exists audit_select on public.audit_logs;
create policy audit_select on public.audit_logs
  for select using (public.is_admin());
