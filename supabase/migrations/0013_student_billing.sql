-- =============================================================================
-- School Management System — student billing (payments)
-- Migration: 0013_student_billing   (idempotent — safe to re-run)
-- =============================================================================

create table if not exists public.student_payments (
  id          uuid primary key default uuid_generate_v4(),
  student_id  uuid not null references public.students (id) on delete cascade,
  amount      numeric(10, 2) not null check (amount > 0),
  paid_on     date not null default current_date,
  for_month   text not null default to_char(current_date, 'YYYY-MM'),
  purpose     text not null default 'Monthly fee',
  method      text,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_student_payments_student on public.student_payments (student_id);
create index if not exists idx_student_payments_month on public.student_payments (for_month);

alter table public.student_payments enable row level security;

drop policy if exists student_payments_read on public.student_payments;
create policy student_payments_read on public.student_payments
  for select using (public.is_staff());

drop policy if exists student_payments_write on public.student_payments;
create policy student_payments_write on public.student_payments
  for all using (public.is_admin()) with check (public.is_admin());
