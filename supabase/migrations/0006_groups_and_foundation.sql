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
