-- =============================================================================
-- ONE-TIME backfill: migrate existing users from relocation_steps/user_steps
-- into the new user_relocation_plan table.
--
-- Safe to re-run: uses ON CONFLICT DO NOTHING + existence check.
-- Run manually against production AFTER reviewing:
--   psql $DATABASE_URL -f scripts/backfill-user-relocation-plan.sql
-- =============================================================================

DO $$
DECLARE
  u         RECORD;
  s         RECORD;
  step_num  INT;
  phase_val TEXT;
  title_val TEXT;
BEGIN

  -- ── 1. Backfill user_relocation_plan ─────────────────────────────────────
  FOR u IN
    SELECT up.user_id
    FROM   public.user_profiles up
    WHERE  up.visa_type IS NOT NULL
      AND  NOT EXISTS (
             SELECT 1
             FROM   public.user_relocation_plan urp
             WHERE  urp.user_id = up.user_id
           )
  LOOP
    step_num := 1;

    FOR s IN
      SELECT
        rs.title,
        rs.description,
        rs.step_number,
        rs.estimated_days,
        us.status,
        us.completed_at
      FROM   public.user_steps      us
      JOIN   public.relocation_steps rs ON rs.id = us.step_id
      WHERE  us.user_id = u.user_id
      ORDER  BY rs.step_number
    LOOP

      -- ── Phase detection ──────────────────────────────────────────────────
      -- Priority 1: bracket prefix added by old onboarding
      --   e.g. "[Entry Preparation] Research entry requirements"
      IF s.title ~ '^\[' THEN
        CASE
          WHEN lower(s.title) ~* '^\[entry|^\[preparation'          THEN phase_val := 'Entry Preparation';
          WHEN lower(s.title) ~* '^\[arrival|^\[arrival & setup'    THEN phase_val := 'Arrival & Setup';
          WHEN lower(s.title) ~* '^\[legal'                         THEN phase_val := 'Legal Status';
          WHEN lower(s.title) ~* '^\[stability|^\[settl'            THEN phase_val := 'Stability';
          ELSE                                                            phase_val := 'Entry Preparation';
        END CASE;
        -- Strip the [Phase] prefix for the clean title
        title_val := trim(regexp_replace(s.title, '^\[.*?\]\s*', ''));

      -- Priority 2: keyword heuristic for seeded/plain titles
      ELSE
        title_val := trim(s.title);
        CASE
          WHEN lower(s.title) ~* 'arriv|accommodation|bank account|sim card|register address|internet setup'
            THEN phase_val := 'Arrival & Setup';
          WHEN lower(s.title) ~* 'visa|residence permit|permit|aima|sef|nif|nie|emirates id|health insurance|biometric|medical fitness|apostil|consulate|vfs|tax status|nhr'
            THEN phase_val := 'Legal Status';
          WHEN lower(s.title) ~* 'daily routine|local network|enroll|settle|long-term|build local'
            THEN phase_val := 'Stability';
          ELSE
            phase_val := 'Entry Preparation';
        END CASE;
      END IF;

      -- ── Map any legacy phase keys that might appear ───────────────────────
      phase_val := CASE phase_val
        WHEN 'Before you move' THEN 'Entry Preparation'
        WHEN 'before_move'     THEN 'Entry Preparation'
        WHEN 'Arrival'         THEN 'Arrival & Setup'
        WHEN 'arrival'         THEN 'Arrival & Setup'
        WHEN 'Legal & Setup'   THEN 'Legal Status'
        WHEN 'legal_setup'     THEN 'Legal Status'
        WHEN 'Settling in'     THEN 'Stability'
        WHEN 'settling_in'     THEN 'Stability'
        ELSE phase_val
      END;

      INSERT INTO public.user_relocation_plan (
        user_id,
        title,
        description,
        phase,
        step_number,
        estimated_days,
        status,
        completed_at
      )
      VALUES (
        u.user_id,
        title_val,
        s.description,
        phase_val,
        COALESCE(s.step_number, step_num),
        COALESCE(s.estimated_days, 7),
        CASE WHEN s.status = 'done' THEN 'done' ELSE 'todo' END,
        s.completed_at
      )
      ON CONFLICT DO NOTHING;

      step_num := step_num + 1;
    END LOOP;

    RAISE NOTICE 'Backfilled % steps for user %', step_num - 1, u.user_id;
  END LOOP;

  -- ── 2. Fix user_documents defaults for all existing rows ─────────────────
  --    Set prepared_without_upload = false where still NULL
  UPDATE public.user_documents
  SET    prepared_without_upload = false
  WHERE  prepared_without_upload IS NULL;

  --    Copy old file_url → storage_path where storage_path is missing
  --    (for rows uploaded before the storage_path column existed)
  UPDATE public.user_documents
  SET    storage_path = file_url
  WHERE  storage_path IS NULL
    AND  file_url IS NOT NULL
    AND  file_url NOT LIKE 'http%';    -- only store bare paths, not legacy full URLs

  --    Set verification_status based on legacy status column
  UPDATE public.user_documents
  SET    verification_status = CASE status
           WHEN 'verified' THEN 'ok'
           WHEN 'pending'  THEN NULL      -- will be set by AI when next uploaded
           ELSE NULL
         END
  WHERE  verification_status IS NULL
    AND  (storage_path IS NOT NULL OR file_url IS NOT NULL);

  RAISE NOTICE 'user_documents defaults patched.';

END $$;
