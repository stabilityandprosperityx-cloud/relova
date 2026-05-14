-- Manual: grant Full plan for support / comped access.
-- Email: Lazeba.an@gmail.com (match case-insensitively).
UPDATE public.user_profiles
SET
  plan = 'full',
  plan_expires_at = NULL
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE lower(btrim(email)) = lower(btrim('Lazeba.an@gmail.com'))
);
