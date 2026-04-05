ALTER TABLE public.scores DROP COLUMN IF EXISTS puzzle_success;
ALTER TABLE public.scores ADD COLUMN puzzle_score numeric DEFAULT 0;