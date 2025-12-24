-- =============================================
-- 迁移脚本 001: 创建 profiles 表和自动同步触发器
-- =============================================
-- 目的：修复 Google OAuth 登录后 profiles 表无记录的问题
-- 创建日期：2025-12-24
-- 说明：此脚本是幂等的，可以安全地重复执行
-- =============================================

-- =============================================
-- 1. 创建 profiles 表
-- =============================================
-- 注意：此表应该替代旧的 users 表（schema.sql 中定义的）
-- profiles 表与 auth.users 一对一关联

CREATE TABLE IF NOT EXISTS public.profiles (
  -- 主键：与 auth.users.id 关联
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 基本信息
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  full_name TEXT,  -- 从 OAuth provider 获取的完整姓名

  -- 统计和成就
  contribution_level INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加注释
COMMENT ON TABLE public.profiles IS '用户资料表，与 auth.users 一对一关联';
COMMENT ON COLUMN public.profiles.id IS '用户ID（FK to auth.users.id）';
COMMENT ON COLUMN public.profiles.email IS '用户邮箱（从 auth.users 同步）';
COMMENT ON COLUMN public.profiles.username IS '用户名（可自定义，唯一）';
COMMENT ON COLUMN public.profiles.avatar_url IS '用户头像 URL（从 OAuth 或自定义）';
COMMENT ON COLUMN public.profiles.full_name IS '用户全名（从 OAuth 提供商获取）';
COMMENT ON COLUMN public.profiles.contribution_level IS '贡献等级（基于投稿、审核等活动）';
COMMENT ON COLUMN public.profiles.badges IS '用户徽章数组';

-- =============================================
-- 2. 创建索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_contribution ON public.profiles(contribution_level DESC);

-- =============================================
-- 3. 启用 Row Level Security (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. 创建 RLS 策略
-- =============================================

-- 策略 1：所有人可以查看所有用户资料（公开可见）
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 策略 2：用户只能插入自己的资料（防止恶意创建）
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 策略 3：用户只能更新自己的资料
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 策略 4：用户不能删除自己的资料（只能通过删除 auth.users 级联删除）
DROP POLICY IF EXISTS "Users cannot delete profiles" ON public.profiles;
CREATE POLICY "Users cannot delete profiles"
  ON public.profiles
  FOR DELETE
  USING (false);

-- =============================================
-- 5. 创建自动更新 updated_at 触发器
-- =============================================

-- 触发器函数已在 schema.sql 中定义（update_updated_at_column）
-- 直接创建触发器

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. 创建自动同步新用户到 profiles 表的触发器函数
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- 从邮箱生成默认用户名（去掉 @ 后面的部分）
  default_username := split_part(NEW.email, '@', 1);

  -- 如果用户名已存在，添加随机后缀
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = default_username) LOOP
    default_username := split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6);
  END LOOP;

  -- 插入新用户资料
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
  VALUES (
    NEW.id,
    NEW.email,
    default_username,
    -- 从 raw_user_meta_data 提取头像（Google OAuth: picture, GitHub: avatar_url）
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    ),
    -- 从 raw_user_meta_data 提取全名（Google OAuth: full_name, GitHub: name）
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    ),
    0,  -- 初始贡献等级
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- 添加函数注释
COMMENT ON FUNCTION public.handle_new_user() IS '触发器函数：当 auth.users 表插入新用户时，自动在 public.profiles 表创建对应记录';

-- =============================================
-- 7. 创建触发器（监听 auth.users 的 INSERT 事件）
-- =============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 添加触发器注释
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS '当新用户注册时，自动在 public.profiles 表创建用户资料';

-- =============================================
-- 8. 授予必要的权限
-- =============================================

-- 授予 authenticated 角色对 profiles 表的访问权限
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- 授予 service_role 角色完全访问权限（用于迁移和管理）
GRANT ALL ON public.profiles TO service_role;

-- =============================================
-- 迁移完成
-- =============================================
-- 下一步：执行 002_backfill_existing_users.sql 来回填现有用户
