-- Citizenship → candidate destination shortlist cache (Layer 1 for country matching)

create table if not exists public.citizenship_candidate_countries (
  id uuid primary key default gen_random_uuid(),
  citizenship_country text not null,
  candidates jsonb not null,
  generated_at timestamptz not null default now(),
  model text,
  prompt_version text not null default 'v1',
  unique (citizenship_country, prompt_version)
);

create index if not exists citizenship_candidate_countries_lookup_idx
  on public.citizenship_candidate_countries (citizenship_country);

-- Internal-only: Edge Function uses service role; no client policies
alter table public.citizenship_candidate_countries enable row level security;
