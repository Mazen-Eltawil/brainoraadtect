
CREATE TABLE public.scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  short_term_score integer DEFAULT 0,
  long_term_score integer DEFAULT 0,
  reordering_correct boolean DEFAULT false,
  puzzle_success boolean DEFAULT false,
  total_score integer DEFAULT 0,
  aq_assessment integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own scores"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own scores"
  ON public.scores FOR SELECT
  TO authenticated
  USING (true);
