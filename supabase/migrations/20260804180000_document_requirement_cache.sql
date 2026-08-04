-- AI document checklist cache + columns for personalized generation flow

create table if not exists public.document_requirement_cache (
  id uuid primary key default gen_random_uuid(),
  citizenship_country text not null,
  destination_country text not null,
  visa_type text not null,
  documents jsonb not null,
  generated_at timestamptz not null default now(),
  model text,
  prompt_version text not null default 'v1',
  unique (citizenship_country, destination_country, visa_type, prompt_version)
);

create index if not exists document_requirement_cache_lookup_idx
  on public.document_requirement_cache (citizenship_country, destination_country, visa_type);

-- Internal-only: Edge Function uses service role; no client policies (same pattern as pending_grants)
alter table public.document_requirement_cache enable row level security;

alter table public.user_documents
  add column if not exists source text not null default 'static',
  add column if not exists phase text,
  add column if not exists category text,
  add column if not exists description text;

-- Add checks only if not already present (idempotent-ish via DO block)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_documents_source_check'
  ) then
    alter table public.user_documents
      add constraint user_documents_source_check
      check (source in ('placeholder', 'ai_generated', 'chat', 'static'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'user_documents_phase_check'
  ) then
    alter table public.user_documents
      add constraint user_documents_phase_check
      check (phase is null or phase in ('before', 'during', 'after'));
  end if;
end $$;

alter table public.user_profiles
  add column if not exists documents_status text not null default 'ready';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_documents_status_check'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_documents_status_check
      check (documents_status in ('generating', 'ready', 'failed'));
  end if;
end $$;
