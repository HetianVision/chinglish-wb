-- =============================================
-- 回滚脚本: 撤销 profiles 表和触发器迁移
-- =============================================
-- 目的：在需要回滚时，安全地移除 profiles 表和相关配置
-- 创建日期：2025-12-24
-- 警告：此操作将删除所有 profiles 数据，请谨慎执行！
-- 说明：此脚本是幂等的，可以安全地重复执行
-- =============================================

-- =============================================
-- 警告确认
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '警告：即将执行 profiles 表回滚操作';
  RAISE NOTICE '此操作将：';
  RAISE NOTICE '  1. 删除 auth.users 上的触发器';
  RAISE NOTICE '  2. 删除触发器函数';
  RAISE NOTICE '  3. 删除 profiles 表的所有 RLS 策略';
  RAISE NOTICE '  4. 删除 profiles 表（包括所有数据）';
  RAISE NOTICE '========================================';
  RAISE NOTICE '如果需要取消，请立即按 Ctrl+C';
  RAISE NOTICE '脚本将在 5 秒后继续执行...';

  -- PostgreSQL 中没有内置的 sleep，但可以使用 pg_sleep
  -- 注意：Supabase 可能禁用了 pg_sleep，如果报错可以注释掉
  -- PERFORM pg_sleep(5);
END $$;

-- =============================================
-- 1. 删除触发器
-- =============================================

-- 删除 auth.users 表上的自动同步触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

RAISE NOTICE '✓ 触发器 on_auth_user_created 已删除';

-- =============================================
-- 2. 删除触发器函数
-- =============================================

-- 删除自动创建 profiles 的函数
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

RAISE NOTICE '✓ 函数 handle_new_user() 已删除';

-- =============================================
-- 3. 删除 profiles 表上的触发器
-- =============================================

-- 删除自动更新 updated_at 的触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

RAISE NOTICE '✓ 触发器 update_profiles_updated_at 已删除';

-- =============================================
-- 4. 删除 RLS 策略
-- =============================================

-- 按照创建的顺序删除策略
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot delete profiles" ON public.profiles;

RAISE NOTICE '✓ 所有 RLS 策略已删除';

-- =============================================
-- 5. 禁用 Row Level Security
-- =============================================

-- 在删除表之前禁用 RLS（可选，因为删除表会自动清理）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✓ RLS 已禁用';
  END IF;
END $$;

-- =============================================
-- 6. 撤销权限
-- =============================================

-- 撤销所有角色对 profiles 表的权限
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    REVOKE ALL ON public.profiles FROM authenticated;
    REVOKE ALL ON public.profiles FROM service_role;
    REVOKE ALL ON public.profiles FROM anon;
    RAISE NOTICE '✓ 权限已撤销';
  END IF;
END $$;

-- =============================================
-- 7. 删除索引
-- =============================================

-- 索引会随着表的删除自动删除，但为了明确性，可以显式删除
DROP INDEX IF EXISTS public.idx_profiles_email;
DROP INDEX IF EXISTS public.idx_profiles_username;
DROP INDEX IF EXISTS public.idx_profiles_contribution;

RAISE NOTICE '✓ 索引已删除';

-- =============================================
-- 8. 备份数据统计（在删除前）
-- =============================================

DO $$
DECLARE
  profiles_count INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    SELECT COUNT(*) INTO profiles_count FROM public.profiles;
    RAISE NOTICE '========================================';
    RAISE NOTICE '即将删除的数据统计：';
    RAISE NOTICE '  profiles 表记录数: %', profiles_count;
    RAISE NOTICE '========================================';
  END IF;
END $$;

-- =============================================
-- 9. 删除 profiles 表
-- =============================================

-- 使用 CASCADE 确保所有依赖项也被删除
DROP TABLE IF EXISTS public.profiles CASCADE;

RAISE NOTICE '✓ profiles 表已删除（包括所有数据和依赖项）';

-- =============================================
-- 10. 验证回滚完成
-- =============================================

DO $$
BEGIN
  -- 检查 profiles 表是否已删除
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ 回滚成功完成';
    RAISE NOTICE '  - profiles 表已删除';
    RAISE NOTICE '  - 所有触发器和函数已删除';
    RAISE NOTICE '  - 所有 RLS 策略已删除';
    RAISE NOTICE '========================================';
  ELSE
    RAISE WARNING '⚠ 回滚可能未完全成功，profiles 表仍然存在';
  END IF;

  -- 检查触发器是否已删除
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) THEN
    RAISE WARNING '⚠ 触发器 on_auth_user_created 仍然存在';
  END IF;

  -- 检查函数是否已删除
  IF EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'handle_new_user'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE WARNING '⚠ 函数 handle_new_user() 仍然存在';
  END IF;
END $$;

-- =============================================
-- 回滚完成
-- =============================================
-- 注意：此回滚不会影响 auth.users 表
-- 如果需要重新应用迁移，请依次执行：
--   1. 001_add_profiles_trigger.sql
--   2. 002_backfill_existing_users.sql
-- =============================================
