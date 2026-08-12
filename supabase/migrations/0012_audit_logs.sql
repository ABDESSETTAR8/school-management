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
