-- ============================================
-- 修复 submissions 表的 RLS 策略
-- ============================================
-- 问题：当前策略只允许 INSERT，但投稿后需要 SELECT 返回数据
-- 解决方案：添加允许用户查看自己投稿的策略

-- 1. 删除旧的严格策略
DROP POLICY IF EXISTS "Admins can view and update submissions" ON submissions;

-- 2. 创建新的策略
-- 允许所有人查看所有投稿（用于返回提交结果）
CREATE POLICY "Anyone can view submissions"
  ON submissions FOR SELECT
  USING (true);

-- 允许管理员查看、更新、删除投稿
CREATE POLICY "Admins can manage submissions"
  ON submissions FOR ALL
  USING (auth.role() = 'admin');

-- 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'submissions';
