-- =============================================================================
-- School Management System — Initial Schema
-- PostgreSQL (Supabase)
-- Migration: 0001_initial_schema
-- =============================================================================
-- Design notes:
--   * `profiles` extends Supabase `auth.users` 1:1 and holds the role.
--   * Role-specific detail lives in dedicated tables (students, guardians, staff)
--     so we never bloat `profiles` with nullable, role-only columns.
--   * Many-to-many relationships use explicit join tables with their own PKs.
--   * Every table carries created_at/updated_at; updated_at is trigger-managed.
--   * Soft-delete via `archived_at` where historical integrity matters.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- 0. ENUMS
-- =============================================================================
create type user_role as enum ('admin', 'teacher', 'student', 'parent', 'worker');
create type enrollment_status as enum ('active', 'transferred', 'withdrawn', 'graduated');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type term_kind as enum ('semester', 'trimester', 'quarter');
create type guardian_relationship as enum ('mother', 'father', 'guardian', 'other');
create type gender as enum ('male', 'female', 'other', 'undisclosed');

-- =============================================================================
-- 1. SHARED: updated_at trigger
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- 2. IDENTITY & ROLES
-- =============================================================================

-- 2.1 profiles — 1:1 with auth.users, single source of truth for role
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          user_role   not null default 'student',
  first_name    text        not null,
  last_name     text        not null,
  email         text        not null unique,
  phone         text,
  avatar_url    text,
  date_of_birth date,
  gender        gender,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_profiles_role on public.profiles (role);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 2.2 students — academic detail for role = 'student'
create table public.students (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null unique references public.profiles (id) on delete cascade,
  admission_no    text not null unique,
  admission_date  date not null default current_date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_students_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- 2.3 guardians — parent/guardian detail for role = 'parent'
create table public.guardians (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null unique references public.profiles (id) on delete cascade,
  occupation  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_guardians_updated_at
  before update on public.guardians
  for each row execute function public.set_updated_at();

-- 2.4 staff — teachers, workers, and admins (employment detail)
create table public.staff (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null unique references public.profiles (id) on delete cascade,
  employee_no   text not null unique,
  job_title     text,
  department    text,
  hire_date     date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_staff_updated_at
  before update on public.staff
  for each row execute function public.set_updated_at();

-- 2.5 student_guardians — M:N (a child may have several guardians, vice versa)
create table public.student_guardians (
  student_id    uuid not null references public.students (id) on delete cascade,
  guardian_id   uuid not null references public.guardians (id) on delete cascade,
  relationship  guardian_relationship not null default 'guardian',
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now(),
  primary key (student_id, guardian_id)
);

create index idx_student_guardians_guardian on public.student_guardians (guardian_id);

-- =============================================================================
-- 3. ACADEMIC STRUCTURE
-- =============================================================================

-- 3.1 academic_years — e.g. "2025–2026"
create table public.academic_years (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (end_date > start_date)
);

-- only one current year at a time
create unique index uq_academic_years_current
  on public.academic_years (is_current) where is_current;

create trigger trg_academic_years_updated_at
  before update on public.academic_years
  for each row execute function public.set_updated_at();

-- 3.2 terms — semesters/quarters within a year
create table public.terms (
  id                uuid primary key default uuid_generate_v4(),
  academic_year_id  uuid not null references public.academic_years (id) on delete cascade,
  name              text not null,
  kind              term_kind not null default 'semester',
  start_date        date not null,
  end_date          date not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (academic_year_id, name),
  check (end_date > start_date)
);

create trigger trg_terms_updated_at
  before update on public.terms
  for each row execute function public.set_updated_at();

-- 3.3 subjects — catalog (Mathematics, Physics, …)
create table public.subjects (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_subjects_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

-- 3.4 classes — a homeroom/section for a given academic year
--     (e.g. "Grade 7 - B", year 2025–2026), optionally with a homeroom teacher
create table public.classes (
  id                   uuid primary key default uuid_generate_v4(),
  academic_year_id     uuid not null references public.academic_years (id) on delete restrict,
  name                 text not null,
  grade_level          int  not null,
  capacity             int  not null default 30,
  homeroom_teacher_id  uuid references public.staff (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (academic_year_id, name),
  check (capacity > 0)
);

create index idx_classes_year on public.classes (academic_year_id);
create index idx_classes_homeroom on public.classes (homeroom_teacher_id);

create trigger trg_classes_updated_at
  before update on public.classes
  for each row execute function public.set_updated_at();

-- 3.5 class_subjects — M:N classes↔subjects, plus the teacher who teaches it
--     This is the "course offering" that attendance hangs off of.
create table public.class_subjects (
  id          uuid primary key default uuid_generate_v4(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id) on delete restrict,
  teacher_id  uuid references public.staff (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (class_id, subject_id)
);

create index idx_class_subjects_class on public.class_subjects (class_id);
create index idx_class_subjects_teacher on public.class_subjects (teacher_id);

create trigger trg_class_subjects_updated_at
  before update on public.class_subjects
  for each row execute function public.set_updated_at();

-- 3.6 enrollments — M:N students↔classes (a student belongs to one class per year,
--     enforced by the partial unique index below)
create table public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.students (id) on delete cascade,
  class_id    uuid not null references public.classes (id) on delete restrict,
  status      enrollment_status not null default 'active',
  enrolled_at date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_enrollments_student on public.enrollments (student_id);
create index idx_enrollments_class on public.enrollments (class_id);

-- a student can only be actively enrolled in one class at a time
create unique index uq_enrollment_active_student
  on public.enrollments (student_id) where status = 'active';

create trigger trg_enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 4. ATTENDANCE
-- =============================================================================

-- 4.1 attendance_sessions — one row per (class_subject, date) the teacher opens
create table public.attendance_sessions (
  id                uuid primary key default uuid_generate_v4(),
  class_subject_id  uuid not null references public.class_subjects (id) on delete cascade,
  session_date      date not null default current_date,
  taken_by          uuid references public.staff (id) on delete set null,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (class_subject_id, session_date)
);

create index idx_attendance_sessions_date on public.attendance_sessions (session_date);

create trigger trg_attendance_sessions_updated_at
  before update on public.attendance_sessions
  for each row execute function public.set_updated_at();

-- 4.2 attendance_records — per-student status within a session
create table public.attendance_records (
  id            uuid primary key default uuid_generate_v4(),
  session_id    uuid not null references public.attendance_sessions (id) on delete cascade,
  student_id    uuid not null references public.students (id) on delete cascade,
  status        attendance_status not null default 'present',
  remark        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (session_id, student_id)
);

create index idx_attendance_records_student on public.attendance_records (student_id);
create index idx_attendance_records_session on public.attendance_records (session_id);

create trigger trg_attendance_records_updated_at
  before update on public.attendance_records
  for each row execute function public.set_updated_at();
