-- ============================================================
-- STAGE 1: user_relocation_plan table + extend user_documents
-- ============================================================

-- 1. Personal relocation plan (per-user copy of steps)
CREATE TABLE public.user_relocation_plan (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title           text        NOT NULL,
  description     text,
  phase           text        NOT NULL,
  step_number     int         NOT NULL,
  estimated_days  int,
  status          text        NOT NULL DEFAULT 'todo'
                              CHECK (status IN ('todo', 'done')),
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz
);

ALTER TABLE public.user_relocation_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own plan only"
  ON public.user_relocation_plan
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Extend user_documents with AI-verification fields
ALTER TABLE public.user_documents
  ADD COLUMN IF NOT EXISTS verification_status text
    CHECK (verification_status IN ('pending', 'ok', 'warning', 'mismatch')),
  ADD COLUMN IF NOT EXISTS verification_note    text,
  ADD COLUMN IF NOT EXISTS storage_path         text,
  ADD COLUMN IF NOT EXISTS prepared_without_upload boolean DEFAULT false;

-- 3. Private Storage bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for the bucket: only the owning user can access their own prefix
CREATE POLICY "user documents: owner access"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
