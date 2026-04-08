
-- Drop old tables
DROP TABLE IF EXISTS public.game_responses CASCADE;
DROP TABLE IF EXISTS public.game_sessions CASCADE;
DROP TABLE IF EXISTS public.scores CASCADE;

-- Create new unified scores table
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  short_term_score INTEGER DEFAULT 0,
  long_term_score INTEGER DEFAULT 0,
  reordering_correct BOOLEAN DEFAULT false,
  puzzle_stage1_score NUMERIC DEFAULT 0,
  puzzle_stage2_score NUMERIC DEFAULT 0,
  puzzle_stage3_score NUMERIC DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  aq_assessment INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Policies: any authenticated user can insert and view all scores
CREATE POLICY "Users can insert scores"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all scores"
  ON public.scores FOR SELECT
  TO authenticated
  USING (true);
