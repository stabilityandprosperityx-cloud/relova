-- Drop legacy tables that are no longer referenced anywhere in the codebase.
-- user_relocation_plan and user_documents are now the single source of truth.
--
-- grep check (src/, excluding types.ts) confirmed zero references before this migration:
--   relocation_steps  → (no matches)
--   user_steps        → (no matches)
--   visa_documents    → (no matches)

drop table if exists public.relocation_steps cascade;
drop table if exists public.user_steps cascade;
drop table if exists public.visa_documents cascade;
