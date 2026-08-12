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
