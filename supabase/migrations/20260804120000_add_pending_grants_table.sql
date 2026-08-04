-- Audit / safety-net table for guest Paddle purchases.
-- Every transaction.completed event that goes through the email-resolution path
-- writes a row here so nothing is silently lost even if downstream steps fail.

create table if not exists public.pending_grants (
  id                    uuid primary key default gen_random_uuid(),
  email                 text not null,
  plan                  text not null,
  paddle_transaction_id text,
  resolved_user_id      uuid references auth.users(id),
  resolution_method     text, -- 'existing_user' | 'auto_created' | 'unresolved'
  raw_event             jsonb,
  created_at            timestamptz not null default now()
);

create index if not exists pending_grants_email_idx on public.pending_grants (email);

-- Only service-role (used by the Edge Function) may read/write this table;
-- normal authenticated users have no access.
alter table public.pending_grants enable row level security;
