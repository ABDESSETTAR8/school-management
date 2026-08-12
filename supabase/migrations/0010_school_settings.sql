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
