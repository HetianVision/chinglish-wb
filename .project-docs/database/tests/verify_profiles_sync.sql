-- =============================================
-- Profiles 表同步验证脚本
-- =============================================
-- 用途：验证 auth.users 与 public.profiles 表的数据一致性
-- 使用方法：在 Supabase SQL Editor 中执行本脚本的各个查询
-- =============================================

-- =============================================
-- 1. 检查 profiles 表是否存在
-- =============================================
-- 预期：应该返回一行，包含表结构信息
SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'profiles';

-- =============================================
-- 2. 检查 profiles 表结构
-- =============================================
-- 预期：应该包含 id, email, full_name, avatar_url, created_at, updated_at 字段
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =============================================
-- 3. 检查触发器是否存在
-- =============================================
-- 预期：应该返回 on_auth_user_created 触发器
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- =============================================
-- 4. 检查触发器函数是否存在
-- =============================================
-- 预期：应该返回 handle_new_user 函数
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- =============================================
-- 5. 数据一致性检查：统计总数
-- =============================================
-- 对比 auth.users 和 profiles 的记录数量
-- 预期：两个数字应该相等
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) AS profiles_count,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) AS difference;

-- =============================================
-- 6. 查找缺失的 profiles 记录
-- =============================================
-- 找出在 auth.users 中存在但在 profiles 中不存在的用户
-- 预期：应该返回 0 行（如果触发器工作正常）
SELECT
  au.id,
  au.email,
  au.created_at AS auth_created_at,
  au.raw_user_meta_data->>'full_name' AS full_name_in_metadata,
  au.raw_user_meta_data->>'avatar_url' AS avatar_url_in_metadata
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- =============================================
-- 7. 查找孤立的 profiles 记录
-- =============================================
-- 找出在 profiles 中存在但在 auth.users 中不存在的记录
-- 预期：应该返回 0 行
SELECT
  p.id,
  p.email,
  p.full_name,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL;

-- =============================================
-- 8. 检查 email 字段一致性
-- =============================================
-- 对比 auth.users 和 profiles 中的 email 是否匹配
-- 预期：应该返回 0 行（所有 email 应该匹配）
SELECT
  au.id,
  au.email AS auth_email,
  p.email AS profile_email,
  CASE
    WHEN au.email != p.email THEN 'MISMATCH'
    ELSE 'MATCH'
  END AS status
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.email != p.email;

-- =============================================
-- 9. 检查 full_name 提取
-- =============================================
-- 验证 OAuth 用户的 full_name 是否正确提取到 profiles
-- 预期：对于 Google OAuth 用户，full_name 应该不为空
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' AS metadata_full_name,
  p.full_name AS profile_full_name,
  CASE
    WHEN au.raw_user_meta_data->>'full_name' IS NOT NULL
         AND p.full_name IS NULL THEN 'MISSING'
    WHEN au.raw_user_meta_data->>'full_name' IS NOT NULL
         AND p.full_name IS NOT NULL THEN 'OK'
    ELSE 'N/A'
  END AS status
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.raw_user_meta_data->>'full_name' IS NOT NULL
ORDER BY au.created_at DESC;

-- =============================================
-- 10. 检查 avatar_url 提取
-- =============================================
-- 验证 OAuth 用户的 avatar_url 是否正确提取到 profiles
-- 预期：对于 Google OAuth 用户，avatar_url 应该不为空
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'avatar_url' AS metadata_avatar_url,
  p.avatar_url AS profile_avatar_url,
  CASE
    WHEN au.raw_user_meta_data->>'avatar_url' IS NOT NULL
         AND p.avatar_url IS NULL THEN 'MISSING'
    WHEN au.raw_user_meta_data->>'avatar_url' IS NOT NULL
         AND p.avatar_url IS NOT NULL THEN 'OK'
    ELSE 'N/A'
  END AS status
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
WHERE au.raw_user_meta_data->>'avatar_url' IS NOT NULL
ORDER BY au.created_at DESC;

-- =============================================
-- 11. 检查 RLS 策略
-- =============================================
-- 验证 profiles 表的 Row Level Security 策略是否正确配置
-- 预期：应该返回至少 3 条策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;

-- =============================================
-- 12. 检查 RLS 是否启用
-- =============================================
-- 预期：rowsecurity 应该为 true
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- =============================================
-- 13. 最近创建的用户详情
-- =============================================
-- 查看最近 10 个用户的详细信息（用于手动验证）
SELECT
  au.id,
  au.email,
  au.created_at AS auth_created_at,
  au.raw_user_meta_data->>'provider' AS auth_provider,
  au.raw_user_meta_data->>'full_name' AS metadata_full_name,
  au.raw_user_meta_data->>'avatar_url' AS metadata_avatar_url,
  p.full_name AS profile_full_name,
  p.avatar_url AS profile_avatar_url,
  p.created_at AS profile_created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- =============================================
-- 14. 按认证提供商统计
-- =============================================
-- 统计不同认证方式的用户数量
-- 预期：应该看到 email 和 google 提供商
SELECT
  au.raw_user_meta_data->>'provider' AS provider,
  COUNT(*) AS user_count,
  COUNT(p.id) AS profile_count,
  COUNT(*) - COUNT(p.id) AS missing_profiles
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
GROUP BY au.raw_user_meta_data->>'provider'
ORDER BY user_count DESC;

-- =============================================
-- 15. 检查时间戳一致性
-- =============================================
-- 验证 profiles 的创建时间应该在 auth.users 创建时间之后或同时
-- 预期：time_diff 应该为 0 或正数（以秒为单位）
SELECT
  au.id,
  au.email,
  au.created_at AS auth_created_at,
  p.created_at AS profile_created_at,
  EXTRACT(EPOCH FROM (p.created_at - au.created_at)) AS time_diff_seconds,
  CASE
    WHEN EXTRACT(EPOCH FROM (p.created_at - au.created_at)) < 0 THEN 'ERROR: Profile created before auth user'
    WHEN EXTRACT(EPOCH FROM (p.created_at - au.created_at)) > 60 THEN 'WARNING: More than 60 seconds delay'
    ELSE 'OK'
  END AS status
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
ORDER BY time_diff_seconds DESC
LIMIT 20;

-- =============================================
-- 执行总结
-- =============================================
-- 将上述查询结果保存到一个临时表中，生成测试报告
-- （可选：高级用户使用）

-- 创建临时报告
DROP TABLE IF EXISTS profiles_sync_report;
CREATE TEMP TABLE profiles_sync_report (
  test_name TEXT,
  status TEXT,
  details TEXT
);

-- 插入测试结果
INSERT INTO profiles_sync_report (test_name, status, details)
SELECT
  'Table Exists' AS test_name,
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  'profiles table found' AS details
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'profiles';

INSERT INTO profiles_sync_report (test_name, status, details)
SELECT
  'Trigger Exists' AS test_name,
  CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  'on_auth_user_created trigger found' AS details
FROM information_schema.triggers
WHERE trigger_schema = 'auth' AND event_object_table = 'users';

INSERT INTO profiles_sync_report (test_name, status, details)
SELECT
  'Data Consistency' AS test_name,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) THEN 'PASS'
    ELSE 'FAIL'
  END AS status,
  'auth.users: ' || (SELECT COUNT(*) FROM auth.users)::TEXT ||
  ', profiles: ' || (SELECT COUNT(*) FROM public.profiles)::TEXT AS details;

INSERT INTO profiles_sync_report (test_name, status, details)
SELECT
  'Missing Profiles' AS test_name,
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS status,
  'Found ' || COUNT(*)::TEXT || ' users without profiles' AS details
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

INSERT INTO profiles_sync_report (test_name, status, details)
SELECT
  'RLS Enabled' AS test_name,
  CASE WHEN rowsecurity = true THEN 'PASS' ELSE 'FAIL' END AS status,
  'Row Level Security is ' || CASE WHEN rowsecurity THEN 'enabled' ELSE 'disabled' END AS details
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 显示测试报告
SELECT * FROM profiles_sync_report ORDER BY test_name;

-- =============================================
-- 清理提示
-- =============================================
-- 如果发现问题，可以使用以下查询来回填缺失的 profiles 记录：
/*
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
*/
