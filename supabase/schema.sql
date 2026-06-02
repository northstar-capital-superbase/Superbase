-- Northstar Labs — shared memory table.
-- Apply in the Supabase SQL editor (or `supabase db push`) to enable
-- cross-session persistence. Without it, the lab uses in-process memory.

create extension if not exists "pgcrypto";

create table if not exists public.lab_memory (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  kind        text not null check (kind in ('message', 'agent_output', 'fact', 'plan')),
  author      text not null,
  content     text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists lab_memory_session_idx
  on public.lab_memory (session_id, created_at desc);

-- The lab uses the service role key from server-side routes, which bypasses
-- RLS. Enable RLS and add policies before exposing the anon key to clients.
alter table public.lab_memory enable row level security;
