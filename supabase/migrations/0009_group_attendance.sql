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
