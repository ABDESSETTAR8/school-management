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
