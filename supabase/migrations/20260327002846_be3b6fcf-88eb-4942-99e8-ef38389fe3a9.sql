
-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  theme_preference TEXT NOT NULL DEFAULT 'system',
  aq_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Game sessions
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  short_term_score INT,
  short_term_total INT,
  long_term_score INT,
  long_term_total INT,
  reordering_correct BOOLEAN,
  reordering_answer TEXT,
  puzzle_success BOOLEAN,
  puzzle_steps INT,
  puzzle_duration_ms INT,
  puzzle_path JSONB,
  total_score INT,
  max_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.game_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.game_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Game responses (per-question logs)
CREATE TABLE public.game_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  target TEXT NOT NULL,
  selected TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.game_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses" ON public.game_responses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.game_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- AQ Assessments
CREATE TABLE public.aq_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INT NOT NULL,
  interpretation TEXT NOT NULL,
  answers_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aq_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own aq" ON public.aq_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own aq" ON public.aq_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
