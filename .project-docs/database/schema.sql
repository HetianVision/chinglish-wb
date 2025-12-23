-- Chinglish 黑白语言站 - 数据库 Schema
-- PostgreSQL (Supabase)

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. terms 表（词条）
-- =============================================
CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chinglish TEXT NOT NULL,
  wrong_example TEXT NOT NULL,
  correct_expression TEXT NOT NULL,
  correct_example TEXT NOT NULL,

  -- 评分数据
  oxford_status TEXT CHECK (oxford_status IN ('collected', 'not_collected')) DEFAULT 'not_collected',
  global_heat INTEGER CHECK (global_heat >= 0 AND global_heat <= 100) DEFAULT 0,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 10) DEFAULT 5,
  funny_score INTEGER CHECK (funny_score >= 0 AND funny_score <= 10) DEFAULT 0,

  -- 分类标签（使用PostgreSQL数组）
  category TEXT[] NOT NULL,
  region TEXT[],

  -- 元数据
  submitted_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 统计
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,

  -- 全文搜索索引
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', chinglish || ' ' || correct_expression || ' ' || wrong_example)
  ) STORED
);

-- 创建索引
CREATE INDEX idx_terms_search ON terms USING GIN(search_vector);
CREATE INDEX idx_terms_category ON terms USING GIN(category);
CREATE INDEX idx_terms_oxford ON terms(oxford_status);
CREATE INDEX idx_terms_risk ON terms(risk_score DESC);
CREATE INDEX idx_terms_heat ON terms(global_heat DESC);
CREATE INDEX idx_terms_created ON terms(created_at DESC);

-- =============================================
-- 2. submissions 表（投稿）
-- =============================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',

  -- 投稿者信息
  submitter_name TEXT,
  submitter_email TEXT,

  -- 投稿内容
  chinglish TEXT NOT NULL,
  wrong_example TEXT NOT NULL,
  correct_expression TEXT NOT NULL,
  correct_example TEXT NOT NULL,
  category TEXT[] NOT NULL,
  region TEXT[],

  -- 可选字段
  estimated_risk_score INTEGER CHECK (estimated_risk_score >= 0 AND estimated_risk_score <= 10),
  funny_story TEXT,

  -- 审核信息
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  reviewed_by TEXT,

  -- 时间戳
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted ON submissions(submitted_at DESC);

-- =============================================
-- 3. term_stats 表（词条统计）
-- =============================================
CREATE TABLE term_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,

  -- 统计类型
  stat_type TEXT CHECK (stat_type IN ('view', 'share', 'like')) NOT NULL,

  -- 元数据
  user_fingerprint TEXT,  -- 用户指纹（防重复统计）
  ip_address INET,
  user_agent TEXT,
  referer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_term_stats_term ON term_stats(term_id);
CREATE INDEX idx_term_stats_type ON term_stats(stat_type);
CREATE INDEX idx_term_stats_created ON term_stats(created_at DESC);
CREATE INDEX idx_term_stats_fingerprint ON term_stats(user_fingerprint);

-- =============================================
-- 4. users 表（后续扩展）
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,

  -- 统计
  contribution_level INTEGER DEFAULT 0,
  badges TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- =============================================
-- Row Level Security (RLS) 策略
-- =============================================

-- 启用RLS
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_stats ENABLE ROW LEVEL SECURITY;

-- terms表：所有人可读，管理员可写
CREATE POLICY "Terms are viewable by everyone"
  ON terms FOR SELECT
  USING (true);

CREATE POLICY "Terms are writable by admins"
  ON terms FOR ALL
  USING (auth.role() = 'admin');

-- submissions表：投稿者可创建，管理员可查看和修改
CREATE POLICY "Anyone can submit"
  ON submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view and update submissions"
  ON submissions FOR ALL
  USING (auth.role() = 'admin');

-- term_stats表：所有人可写（统计），管理员可读
CREATE POLICY "Anyone can record stats"
  ON term_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view stats"
  ON term_stats FOR SELECT
  USING (auth.role() = 'admin');

-- =============================================
-- 自动更新 updated_at 触发器
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RPC 函数：增加词条浏览次数
-- =============================================
CREATE OR REPLACE FUNCTION increment_term_views(term_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE terms
  SET views = views + 1
  WHERE id = term_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC 函数：增加词条分享次数
-- =============================================
CREATE OR REPLACE FUNCTION increment_term_shares(term_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE terms
  SET shares = shares + 1
  WHERE id = term_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
