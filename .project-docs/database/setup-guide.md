# Supabase 数据库设置指南

## 步骤 1: 创建数据库表

1. 打开您的 Supabase 项目控制台
2. 点击左侧菜单的 **SQL Editor**
3. 点击 **New Query** 创建新查询
4. 复制 `.project-docs/database/schema.sql` 文件的全部内容
5. 粘贴到 SQL 编辑器中
6. 点击 **Run** 按钮执行 SQL

这将创建以下数据库表：
- `terms` - 词条表
- `submissions` - 投稿表
- `term_stats` - 统计表
- `users` - 用户表（后期使用）

以及相关的：
- 索引
- Row Level Security (RLS) 策略
- 触发器
- RPC 函数

## 步骤 2: 验证表创建

在 SQL Editor 中运行以下查询，确认表已创建：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

您应该看到：
- submissions
- term_stats
- terms
- users

## 步骤 3: 导入测试数据（可选）

如果您想快速测试，可以运行以下 SQL 导入6条测试数据：

```sql
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
) VALUES
(
  'add oil',
  'You need to add oil to finish this project!',
  'cheer up / keep going',
  'You need to keep going to finish this project!',
  'collected',
  95,
  8,
  7,
  ARRAY['日常', '口语'],
  ARRAY['中国大陆', '香港'],
  'Community',
  15420,
  342
),
(
  'long time no see',
  'Long time no see! How have you been?',
  'It''s been a while / Haven''t seen you in ages',
  'It''s been a while! How have you been?',
  'collected',
  92,
  3,
  5,
  ARRAY['日常', '口语'],
  ARRAY['全球'],
  'Community',
  12890,
  256
),
(
  'no can do',
  'Sorry, no can do. I''m busy today.',
  'I can''t do it / That''s not possible',
  'Sorry, I can''t do it. I''m busy today.',
  'collected',
  78,
  6,
  6,
  ARRAY['日常', '商务'],
  ARRAY['北美'],
  'User123',
  8934,
  167
),
(
  'people mountain people sea',
  'The shopping mall was people mountain people sea during the holiday.',
  'crowded / packed with people',
  'The shopping mall was packed with people during the holiday.',
  'not_collected',
  88,
  9,
  10,
  ARRAY['日常', '网络'],
  ARRAY['中国大陆'],
  'PandaLover',
  21567,
  543
),
(
  'good good study, day day up',
  'My teacher always says: good good study, day day up!',
  'study hard and make progress every day',
  'My teacher always says: study hard and make progress every day!',
  'not_collected',
  85,
  10,
  9,
  ARRAY['学术', '网络'],
  ARRAY['中国大陆'],
  'StudentLife',
  18234,
  421
),
(
  'you can you up, no can no BB',
  'If you think you can do better, you can you up, no can no BB!',
  'If you can do it, then do it; if not, don''t criticize',
  'If you think you can do better, then prove it instead of just criticizing!',
  'not_collected',
  72,
  10,
  8,
  ARRAY['网络', '口语'],
  ARRAY['中国大陆'],
  'InternetSlang',
  9876,
  234
);
```

## 步骤 4: 测试网站

1. 确保开发服务器正在运行：`npm run dev`
2. 访问 http://localhost:3001
3. 您应该能看到：
   - 首页显示测试数据（如果导入了）
   - 榜单页面正常显示
   - 点击词条可以查看详情
   - 投稿功能可以提交新词条

## 步骤 5: 查看投稿数据

在 Supabase SQL Editor 中查看投稿：

```sql
SELECT * FROM submissions ORDER BY submitted_at DESC;
```

## 常见问题

### Q: 运行 schema.sql 报错？
A: 确保您的 Supabase 项目已启用 PostgreSQL。某些功能需要 Postgres 14+。

### Q: 无法看到数据？
A: 检查浏览器控制台（F12）是否有错误信息。确认 `.env.local` 文件中的凭证正确。

### Q: 投稿后看不到数据？
A: 投稿会进入 `submissions` 表（状态为 pending），需要管理员审核后才会出现在 `terms` 表。

## 下一步

数据库设置完成后，您可以：
1. ✅ 测试所有页面功能
2. 📝 准备您的初始数据（50-100条）
3. 🔧 开发管理员审核面板
4. 📤 实现分享功能
5. 🚀 部署到 Vercel
