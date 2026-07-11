-- Northstar Labs — database schema.
-- Apply in the Supabase SQL editor (or `supabase db push`). Mirrors the
-- migrations applied to the project; keep this file in sync with any new
-- migration so a fresh Supabase project can be bootstrapped from one file.

create extension if not exists "pgcrypto";

-- ── Shared agent memory ──────────────────────────────────────────────────────
-- Cross-agent memory for the multi-agent crew. Every row is now owned by the
-- authenticated user who ran the session; user_id is nullable only to
-- tolerate rows written before authentication existed.
create table if not exists public.lab_memory (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  kind        text not null check (kind in ('message', 'agent_output', 'fact', 'plan')),
  author      text not null,
  content     text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users(id) on delete cascade
);

-- Brownfield upgrade: CREATE TABLE IF NOT EXISTS leaves an existing
-- pre-auth lab_memory table untouched. Add the ownership column explicitly
-- before enabling owner-based RLS policies below.
alter table public.lab_memory
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists lab_memory_session_idx
  on public.lab_memory (session_id, created_at desc);

create index if not exists lab_memory_user_session_idx
  on public.lab_memory (user_id, session_id, created_at desc);

alter table public.lab_memory enable row level security;

-- User-owned routes authenticate as the caller with their session JWT and
-- the anon key, so these policies enforce ownership in Postgres. The service
-- role must never be used for user-owned memory reads or writes.
drop policy if exists "Users see own memory" on public.lab_memory;
create policy "Users see own memory" on public.lab_memory
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own memory" on public.lab_memory;
create policy "Users insert own memory" on public.lab_memory
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own memory" on public.lab_memory;
create policy "Users update own memory" on public.lab_memory
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own memory" on public.lab_memory;
create policy "Users delete own memory" on public.lab_memory
  for delete using (auth.uid() = user_id);

-- ── User profiles ────────────────────────────────────────────────────────────
-- One row per auth.users account. display_name powers the personalized
-- greeting ("Good morning, {display_name}") with a safe generic fallback —
-- Northstar never hardcodes or fabricates a user's name.
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users see own profile" on public.profiles;
create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own profile" on public.profiles;
create policy "Users delete own profile" on public.profiles
  for delete using (auth.uid() = user_id);

-- Auto-provision a profile the moment a new auth user is created, so every
-- account has one without relying on client-side bootstrap code. Restricted
-- to the trigger only — never callable directly via the REST/RPC API.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at current on profile edits (e.g. display name changes).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Backfill profiles for any pre-existing auth users. Safe/idempotent to
-- re-run against a project seeded before this migration existed.
insert into public.profiles (user_id)
select u.id from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

-- ── Owner setup checklist ────────────────────────────────────────────────────
-- 1. In Supabase Auth settings, confirm "Enable email provider" is on.
--    For local/dev testing without transactional email, either disable
--    "Confirm email" or confirm test users directly:
--      update auth.users set email_confirmed_at = now() where email = '...';
-- 2. Recommended (production): enable "Leaked password protection" under
--    Auth → Policies — https://supabase.com/docs/guides/auth/password-security
-- 3. Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (client) and
--    SUPABASE_SERVICE_ROLE_KEY (server) in your environment.
