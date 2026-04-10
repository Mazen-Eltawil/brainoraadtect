
-- Drop old table and recreate with new schema
DROP TABLE IF EXISTS public.scores;

CREATE TABLE public.scores (
  id text PRIMARY KEY,
  email text NOT NULL,
  short_term_score integer DEFAULT 0,
  long_term_score integer DEFAULT 0,
  reordering_correct integer DEFAULT 0,
  puzzle_stage1_score numeric DEFAULT 0,
  puzzle_stage2_score numeric DEFAULT 0,
  puzzle_stage3_score numeric DEFAULT 0,
  total_score integer DEFAULT 0,
  aq_assessment integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert scores"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all scores"
  ON public.scores FOR SELECT
  TO authenticated
  USING (true);
