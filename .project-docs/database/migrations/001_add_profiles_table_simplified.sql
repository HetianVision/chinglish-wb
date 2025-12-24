-- ============================================
-- Profiles Table Migration (Simplified - No auth.users Trigger)
-- ============================================
--
-- This script creates the profiles table WITHOUT triggers on auth.users
-- (Supabase doesn't allow triggers on auth.users via SQL Editor)
--
-- Sync strategy: Application-layer sync in auth callbacks
-- Execution: Supabase Dashboard → SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- 1. Create profiles table
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  contribution_level INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_contribution_level ON public.profiles(contribution_level DESC);

-- ============================================
-- 3. Create updated_at trigger for profiles table
-- ============================================

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================
-- 4. Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent manual deletion (only cascade deletion allowed)
DROP POLICY IF EXISTS "Users cannot delete profiles manually" ON public.profiles;
CREATE POLICY "Users cannot delete profiles manually"
  ON public.profiles FOR DELETE
  USING (false);

-- ============================================
-- 5. Helper function: Create or update profile
-- ============================================

CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT DEFAULT NULL,
  user_avatar_url TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email if not exists
  generated_username := SPLIT_PART(user_email, '@', 1);

  -- Handle username conflicts with random suffix
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = generated_username AND id != user_id) THEN
    generated_username := generated_username || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6);
  END IF;

  -- Upsert profile
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    avatar_url,
    contribution_level,
    badges
  )
  VALUES (
    user_id,
    user_email,
    generated_username,
    user_full_name,
    user_avatar_url,
    0,
    '{}'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Grant permissions
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile TO authenticated, service_role;

COMMIT;

-- ============================================
-- Migration complete
-- ============================================

SELECT
  'Profiles table created successfully!' as status,
  (SELECT COUNT(*) FROM public.profiles) as current_profiles_count;
