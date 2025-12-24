-- =============================================
-- 迁移脚本 002: 回填现有用户到 profiles 表
-- =============================================
-- 目的：为所有已存在的 auth.users 创建对应的 public.profiles 记录
-- 创建日期：2025-12-24
-- 说明：此脚本是幂等的，只会插入尚未存在的用户
-- =============================================

-- =============================================
-- 前置检查：确保 profiles 表存在
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) THEN
    RAISE EXCEPTION 'profiles 表不存在，请先执行 001_add_profiles_trigger.sql';
  END IF;
END $$;

-- =============================================
-- 回填现有用户
-- =============================================

-- 为所有 auth.users 中存在但 public.profiles 中不存在的用户创建记录
INSERT INTO public.profiles (
  id,
  email,
  username,
  avatar_url,
  full_name,
  contribution_level,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  -- 生成唯一用户名：从邮箱提取 + 随机后缀（如果重复）
  CASE
    WHEN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE username = split_part(au.email, '@', 1)
    )
    THEN split_part(au.email, '@', 1) || '_' || substr(md5(au.id::text), 1, 6)
    ELSE split_part(au.email, '@', 1)
  END AS username,
  -- 从 raw_user_meta_data 提取头像
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture',
    NULL
  ) AS avatar_url,
  -- 从 raw_user_meta_data 提取全名
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    NULL
  ) AS full_name,
  0 AS contribution_level,  -- 初始贡献等级
  au.created_at,
  NOW() AS updated_at
FROM
  auth.users au
WHERE
  -- 只插入尚未存在于 profiles 表中的用户
  NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

-- =============================================
-- 输出回填结果统计
-- =============================================

DO $$
DECLARE
  auth_users_count INTEGER;
  profiles_count INTEGER;
  newly_created INTEGER;
BEGIN
  -- 统计 auth.users 中的用户数
  SELECT COUNT(*) INTO auth_users_count FROM auth.users;

  -- 统计 profiles 中的用户数
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;

  -- 计算新创建的记录数
  newly_created := profiles_count - (profiles_count - auth_users_count);

  -- 输出统计信息
  RAISE NOTICE '========================================';
  RAISE NOTICE '回填统计：';
  RAISE NOTICE '  auth.users 总用户数: %', auth_users_count;
  RAISE NOTICE '  profiles 当前记录数: %', profiles_count;
  RAISE NOTICE '  本次回填创建记录数: %', GREATEST(0, auth_users_count - (profiles_count - newly_created));
  RAISE NOTICE '========================================';

  -- 检查是否完全同步
  IF auth_users_count = profiles_count THEN
    RAISE NOTICE '✓ 同步完成：所有 auth.users 都有对应的 profiles 记录';
  ELSE
    RAISE WARNING '⚠ 同步不完整：auth.users (%) != profiles (%)', auth_users_count, profiles_count;
    RAISE WARNING '  可能存在数据不一致，请检查';
  END IF;
END $$;

-- =============================================
-- 验证数据完整性
-- =============================================

-- 检查是否有 auth.users 记录没有对应的 profiles 记录
DO $$
DECLARE
  missing_profiles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_profiles_count
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );

  IF missing_profiles_count > 0 THEN
    RAISE WARNING '⚠ 发现 % 个 auth.users 记录没有对应的 profiles 记录', missing_profiles_count;

    -- 列出缺失的用户（最多显示 10 个）
    RAISE NOTICE '缺失 profiles 的用户 ID（前10个）：';
    FOR rec IN (
      SELECT au.id, au.email
      FROM auth.users au
      WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = au.id
      )
      LIMIT 10
    ) LOOP
      RAISE NOTICE '  - ID: %, Email: %', rec.id, rec.email;
    END LOOP;
  ELSE
    RAISE NOTICE '✓ 数据完整性检查通过：所有用户都有对应的 profiles 记录';
  END IF;
END $$;

-- =============================================
-- 检查用户名唯一性
-- =============================================

DO $$
DECLARE
  duplicate_usernames_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_usernames_count
  FROM (
    SELECT username, COUNT(*) as cnt
    FROM public.profiles
    GROUP BY username
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_usernames_count > 0 THEN
    RAISE WARNING '⚠ 发现 % 个重复的用户名', duplicate_usernames_count;

    -- 列出重复的用户名
    RAISE NOTICE '重复的用户名：';
    FOR rec IN (
      SELECT username, COUNT(*) as cnt
      FROM public.profiles
      GROUP BY username
      HAVING COUNT(*) > 1
      LIMIT 10
    ) LOOP
      RAISE NOTICE '  - Username: % (出现 % 次)', rec.username, rec.cnt;
    END LOOP;
  ELSE
    RAISE NOTICE '✓ 用户名唯一性检查通过';
  END IF;
END $$;

-- =============================================
-- 迁移完成
-- =============================================
-- 现在所有现有用户都应该在 profiles 表中有对应记录
-- 新用户将通过触发器自动创建 profiles 记录
