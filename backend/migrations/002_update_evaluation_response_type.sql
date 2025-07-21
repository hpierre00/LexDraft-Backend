ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS compliance_check_results JSONB;

ALTER TABLE public.documents
ALTER COLUMN evaluation_response TYPE JSONB USING evaluation_response::jsonb; 