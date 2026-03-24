ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS family_status text DEFAULT 'single',
  ADD COLUMN IF NOT EXISTS timeline text DEFAULT 'exploring',
  ADD COLUMN IF NOT EXISTS constraints text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS match_score integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recommended_country text DEFAULT NULL;