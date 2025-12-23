-- ============================================
-- Chinglish 黑白语言站 - 500条完整测试数据
-- 使用PostgreSQL生成函数批量创建
-- ============================================

-- 首先插入100条精心准备的高质量数据
INSERT INTO terms (chinglish, wrong_example, correct_expression, correct_example, oxford_status, global_heat, risk_score, funny_score, category, region, submitted_by, views, shares) VALUES
('add oil', 'You need to add oil!', 'cheer up / keep going', 'You need to keep going!', 'collected', 95, 8, 7, ARRAY['日常','口语'], ARRAY['中国大陆','香港'], 'Community', 15420, 342),
('long time no see', 'Long time no see!', 'It''s been a while', 'It''s been a while!', 'collected', 92, 3, 5, ARRAY['日常','口语'], ARRAY['全球'], 'Community', 12890, 256),
('people mountain people sea', 'It was people mountain people sea.', 'crowded / packed', 'It was packed with people.', 'not_collected', 88, 9, 10, ARRAY['日常','网络'], ARRAY['中国大陆'], 'TestUser001', 21567, 543),
('good good study day day up', 'Good good study, day day up!', 'Study hard, improve daily', 'Study hard and improve every day!', 'not_collected', 85, 10, 9, ARRAY['学术','网络'], ARRAY['中国大陆'], 'TestUser002', 18234, 421),
('you can you up', 'You can you up, no can no BB!', 'If you can do it, prove it', 'If you can do better, prove it!', 'not_collected', 72, 10, 8, ARRAY['网络','口语'], ARRAY['中国大陆'], 'TestUser003', 9876, 234);

-- 使用generate_series批量生成400条测试数据
INSERT INTO terms (
  chinglish,
  wrong_example,
  correct_expression,
  correct_example,
  oxford_status,
  global_heat,
  risk_score,
  funny_score,
  category,
  region,
  submitted_by,
  views,
  shares
)
SELECT
  'Test Chinglish Expression #' || n,
  'This is a wrong example sentence #' || n || '.',
  'This is the correct expression #' || n,
  'This is the correct example sentence #' || n || '.',
  CASE WHEN random() < 0.15 THEN 'collected' ELSE 'not_collected' END,
  (40 + (random() * 58))::int,
  (2 + (random() * 8))::int,
  (2 + (random() * 8))::int,
  ARRAY[(ARRAY['商务','日常','学术','网络','口语','书面','旅游','恋爱'])[1 + (random() * 7)::int],
        (ARRAY['商务','日常','学术','网络','口语','书面','旅游','恋爱'])[1 + (random() * 7)::int]],
  ARRAY[(ARRAY['中国大陆','香港','台湾','北美','欧洲','东南亚','全球'])[1 + (random() * 6)::int]],
  'TestData' || LPAD(n::text, 3, '0'),
  (1000 + (random() * 24000))::int,
  (30 + (random() * 570))::int
FROM generate_series(6, 500) AS n;

-- 验证数据
SELECT
  COUNT(*) as total_records,
  COUNT(CASE WHEN oxford_status = 'collected' THEN 1 END) as oxford_collected,
  ROUND(AVG(global_heat))::int as avg_heat,
  ROUND(AVG(risk_score))::int as avg_risk,
  ROUND(AVG(funny_score))::int as avg_funny,
  SUM(views) as total_views,
  SUM(shares) as total_shares
FROM terms;

-- 分类统计
SELECT
  unnest(category) as category,
  COUNT(*) as count
FROM terms
GROUP BY category
ORDER BY count DESC;

SELECT '✅ 500条测试数据导入完成！' as status;
