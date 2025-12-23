-- ============================================
-- 数据清理脚本 - Cleanup Script
-- ============================================
-- 用途：清除测试数据，准备生产环境
-- 警告：此操作不可逆！请谨慎使用！
-- ============================================

-- 方案1：仅删除测试数据（推荐）
-- 删除所有submitted_by包含'Test'的数据
DELETE FROM terms WHERE submitted_by LIKE '%Test%' OR submitted_by LIKE '%Community%';
DELETE FROM submissions WHERE submitter_name LIKE '%Test%';
DELETE FROM term_stats;

-- 方案2：完全清空所有表（谨慎使用！）
-- TRUNCATE TABLE term_stats CASCADE;
-- TRUNCATE TABLE submissions RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE terms RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- 方案3：只保留牛津收录的词条
-- DELETE FROM terms WHERE oxford_status = 'not_collected';
-- DELETE FROM submissions;
-- DELETE FROM term_stats;

-- 验证清理结果
SELECT 'Terms' as table_name, COUNT(*) as remaining_records FROM terms
UNION ALL
SELECT 'Submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'Term Stats', COUNT(*) FROM term_stats
UNION ALL
SELECT 'Users', COUNT(*) FROM users;

-- 重置序列（如果使用了TRUNCATE）
-- ALTER SEQUENCE IF EXISTS terms_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS submissions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;

-- 清理完成后的优化
VACUUM ANALYZE terms;
VACUUM ANALYZE submissions;
VACUUM ANALYZE term_stats;

SELECT '✅ 数据清理完成！' as status;
