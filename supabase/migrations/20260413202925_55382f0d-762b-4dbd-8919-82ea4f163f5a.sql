
CREATE TABLE public.click_motion_tracking (
  id text NOT NULL PRIMARY KEY,
  email text NOT NULL,
  trial_number integer NOT NULL,
  click_coordinates jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_clicks integer NOT NULL DEFAULT 0,
  correctness_sequence jsonb DEFAULT '[]'::jsonb,
  box_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_click_motion_email ON public.click_motion_tracking (email);
CREATE INDEX idx_click_motion_trial ON public.click_motion_tracking (trial_number);

ALTER TABLE public.click_motion_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert click motion data"
ON public.click_motion_tracking
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view click motion data"
ON public.click_motion_tracking
FOR SELECT
TO authenticated
USING (true);
