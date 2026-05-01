-- Auto-increment sequence for user codes
CREATE SEQUENCE IF NOT EXISTS profiles_code_seq START 1;

-- Helper: generate NPxxxxx code
CREATE OR REPLACE FUNCTION generate_user_code()
RETURNS text LANGUAGE sql AS $$
  SELECT 'NP' || LPAD(nextval('profiles_code_seq')::text, 5, '0')
$$;

-- Profiles table
CREATE TABLE profiles (
  id          uuid  REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  user_code   text  UNIQUE NOT NULL,
  full_name   text  NOT NULL DEFAULT '',
  phone       text  NOT NULL DEFAULT '',
  line_id     text  NOT NULL DEFAULT '',
  role        text  NOT NULL DEFAULT 'seller' CHECK (role IN ('admin','affiliate','seller')),
  avatar_url  text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, user_code, full_name, avatar_url)
  VALUES (
    NEW.id,
    generate_user_code(),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Security definer to check admin without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
$$;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- Backfill profiles for existing auth users (make them admin since only admin existed)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    INSERT INTO profiles (id, user_code, full_name, role)
    VALUES (
      r.id,
      generate_user_code(),
      COALESCE(r.raw_user_meta_data->>'full_name', r.email, 'Admin'),
      'admin'
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;
