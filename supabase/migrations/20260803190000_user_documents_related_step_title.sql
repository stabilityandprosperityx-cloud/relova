-- Add nullable related_step_title column to user_documents
-- Used to link a document to the specific plan step it belongs to
-- (e.g. "Criminal record certificate" → "Apply for NHR tax status")
alter table public.user_documents
  add column if not exists related_step_title text;
