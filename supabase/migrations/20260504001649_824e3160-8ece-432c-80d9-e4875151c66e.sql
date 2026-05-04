
-- Helper: auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- learning_entries
CREATE TABLE public.learning_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  date DATE NOT NULL,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX learning_entries_user_idx ON public.learning_entries(user_id);
CREATE INDEX learning_entries_user_cat_idx ON public.learning_entries(user_id, category_id);
ALTER TABLE public.learning_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own entries select" ON public.learning_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own entries insert" ON public.learning_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own entries update" ON public.learning_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own entries delete" ON public.learning_entries FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER learning_entries_updated_at BEFORE UPDATE ON public.learning_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- study_goals
CREATE TABLE public.study_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  target_unit TEXT,
  start_date DATE,
  end_date DATE,
  current NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX study_goals_user_idx ON public.study_goals(user_id);
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals select" ON public.study_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own goals insert" ON public.study_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own goals update" ON public.study_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own goals delete" ON public.study_goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER study_goals_updated_at BEFORE UPDATE ON public.study_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_categories (one row per user, holds the full categories JSON)
CREATE TABLE public.user_categories (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categories select" ON public.user_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own categories insert" ON public.user_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own categories update" ON public.user_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own categories delete" ON public.user_categories FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER user_categories_updated_at BEFORE UPDATE ON public.user_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_settings
CREATE TABLE public.user_settings (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings select" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own settings insert" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own settings update" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own settings delete" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
