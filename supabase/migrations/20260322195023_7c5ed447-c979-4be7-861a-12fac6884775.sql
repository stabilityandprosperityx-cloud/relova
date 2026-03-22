ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS questions_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone;