-- =============================================================================
-- ONE-TIME reset: clear plan/documents/steps/chat for a test user.
--
-- Does NOT touch user_profiles or auth.users — profile stays intact.
-- Run manually via Supabase SQL Editor, NOT as part of migrations/deploy.
-- =============================================================================

DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'kudotigerman@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User not found';
    RETURN;
  END IF;

  DELETE FROM public.user_relocation_plan WHERE user_id = target_user_id;
  DELETE FROM public.user_documents       WHERE user_id = target_user_id;
  DELETE FROM public.user_steps           WHERE user_id = target_user_id;
  DELETE FROM public.chat_messages        WHERE user_id = target_user_id;

  RAISE NOTICE 'Cleared plan/documents/steps/chat for user %', target_user_id;
END $$;
