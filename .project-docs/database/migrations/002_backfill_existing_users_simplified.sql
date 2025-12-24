-- ============================================
-- Backfill Existing Users to Profiles Table
-- ============================================
--
-- This script syncs all existing auth.users to profiles table
-- Uses the upsert_user_profile helper function
-- Safe to run multiple times (idempotent)
-- ============================================

DO $$
DECLARE
  user_record RECORD;
  processed_count INTEGER := 0;
  error_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting backfill of existing users...';

  FOR user_record IN
    SELECT
      id,
      email,
      raw_user_meta_data->>'full_name' as full_name,
      COALESCE(
        raw_user_meta_data->>'avatar_url',
        raw_user_meta_data->>'picture'
      ) as avatar_url
    FROM auth.users
    ORDER BY created_at ASC
  LOOP
    BEGIN
      -- Call upsert function
      PERFORM public.upsert_user_profile(
        user_record.id,
        user_record.email,
        user_record.full_name,
        user_record.avatar_url
      );

      processed_count := processed_count + 1;

      -- Log progress every 100 users
      IF processed_count % 100 = 0 THEN
        RAISE NOTICE 'Processed % users...', processed_count;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      RAISE WARNING 'Error processing user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Backfill complete: % users processed, % errors', processed_count, error_count;
END $$;

-- ============================================
-- Verify synchronization
-- ============================================

SELECT
  'Backfill verification' as check_name,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) as difference,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles)
    THEN '✓ PASS: All users synced'
    ELSE '✗ FAIL: Sync incomplete'
  END as result;

-- Show sample of synced profiles
SELECT
  au.email,
  p.username,
  p.full_name,
  p.avatar_url,
  p.created_at
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
ORDER BY p.created_at DESC
LIMIT 5;
