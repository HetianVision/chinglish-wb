# 测试数据导入指南

## 📊 数据集说明

已为您准备好3个SQL文件：

### 1. **schema.sql** - 数据库表结构
- 位置：`.project-docs/database/schema.sql`
- 内容：创建所有表、索引、RLS策略、触发器、RPC函数
- **必须首先执行**

### 2. **seed-data-500-complete.sql** - 500条测试数据 ⭐
- 位置：`.project-docs/database/seed-data-500-complete.sql`
- 内容：
  - 5条精心准备的高质量Chinglish词条（add oil, long time no see等）
  - 495条自动生成的测试数据
  - 随机化的评分、分类、地区
  - 约15%的词条标记为牛津收录
- **推荐使用此文件**

### 3. **cleanup.sql** - 数据清理脚本
- 位置：`.project-docs/database/cleanup.sql`
- 用途：上线前清除测试数据
- 提供3种清理方案

---

## 🚀 快速开始（3步）

### Step 1: 创建数据库表

1. 打开 Supabase 项目：https://bdndxbcmdvsgmapmgalh.supabase.co
2. 点击左侧菜单 **SQL Editor**
3. 新建查询，复制 `schema.sql` 全部内容
4. 点击 **Run** 执行

**预期结果**：
```
✅ CREATE TABLE (4个表)
✅ CREATE INDEX (6个索引)
✅ CREATE POLICY (RLS策略)
✅ CREATE FUNCTION (2个RPC函数)
```

### Step 2: 导入测试数据

1. 在 SQL Editor 中新建查询
2. 复制 `seed-data-500-complete.sql` 全部内容
3. 点击 **Run** 执行

**预期结果**：
```sql
total_records | oxford_collected | avg_heat | avg_risk | avg_funny | total_views | total_shares
--------------|------------------|----------|----------|-----------|-------------|-------------
500           | ~75              | 69       | 6        | 6         | ~6,000,000  | ~120,000
```

### Step 3: 验证数据

刷新您的网站：http://localhost:3001

您应该看到：
- ✅ 首页显示热门词条
- ✅ 榜单页面有6个排行榜的数据
- ✅ 点击词条可以查看详情
- ✅ 搜索功能可以搜索到数据

---

## 📝 数据特点

### 生成的500条数据包含：

**分类分布**（随机）：
- 商务、日常、学术、网络、口语、书面、旅游、恋爱
- 每条词条包含1-2个分类

**地区分布**（随机）：
- 中国大陆、香港、台湾、北美、欧洲、东南亚、全球
- 每条词条包含1个地区

**评分范围**：
- 全球热度：40-98
- 风险指数：2-10
- 趣味指数：2-10
- 浏览量：1,000-25,000
- 分享次数：30-600

**牛津收录**：
- 约15%的词条标记为 oxford_status = 'collected'
- 其余85%为 'not_collected'

---

## 🧹 上线前清理测试数据

### 方案1：仅删除测试数据（推荐）

```sql
-- 在 Supabase SQL Editor 中运行
DELETE FROM terms WHERE submitted_by LIKE '%Test%' OR submitted_by LIKE '%Community%';
DELETE FROM submissions WHERE submitter_name LIKE '%Test%';
DELETE FROM term_stats;
```

这将删除所有 `submitted_by` 包含 "Test" 或 "Community" 的数据。

### 方案2：完全清空（谨慎！）

直接在 SQL Editor 运行 `cleanup.sql` 文件。

### 方案3：只保留精品

```sql
-- 只保留牛津收录的词条
DELETE FROM terms WHERE oxford_status = 'not_collected';
```

---

## 🔍 数据查询示例

### 查看总览

```sql
SELECT
  COUNT(*) as 总词条数,
  COUNT(CASE WHEN oxford_status = 'collected' THEN 1 END) as 牛津收录数,
  SUM(views) as 总浏览量,
  SUM(shares) as 总分享数
FROM terms;
```

### 查看热门词条

```sql
SELECT chinglish, global_heat, views, shares
FROM terms
ORDER BY global_heat DESC
LIMIT 10;
```

### 查看高风险词条

```sql
SELECT chinglish, risk_score, wrong_example, correct_expression
FROM terms
ORDER BY risk_score DESC
LIMIT 10;
```

### 按分类统计

```sql
SELECT
  unnest(category) as 分类,
  COUNT(*) as 词条数
FROM terms
GROUP BY category
ORDER BY count DESC;
```

---

## ⚠️ 注意事项

1. **首次导入**：
   - 先运行 `schema.sql`
   - 再运行 `seed-data-500-complete.sql`
   - 不要重复运行，否则会产生重复数据

2. **重新导入**：
   - 如果需要重新导入，先运行：
     ```sql
     TRUNCATE TABLE terms CASCADE;
     ```
   - 然后再次运行 `seed-data-500-complete.sql`

3. **性能优化**：
   - 500条数据足够测试
   - 如果需要更多，可以修改 `generate_series(6, 500)` 中的数字
   - 建议不超过10,000条测试数据

4. **数据备份**：
   - Supabase 自动备份
   - 可在 Settings → Database → Backups 查看

---

## 🎯 下一步

数据导入完成后：
1. ✅ 测试所有页面功能
2. ✅ 测试搜索功能
3. ✅ 测试投稿功能（数据会进入 submissions 表）
4. 📝 开发管理员审核面板
5. 📤 实现分享功能
6. 🚀 部署到 Vercel

---

## 🆘 常见问题

**Q: 运行 schema.sql 报错？**
A: 检查是否已有同名表。可以先运行 `DROP TABLE IF EXISTS terms CASCADE;` 清理。

**Q: 数据导入后网站显示空白？**
A: 检查浏览器控制台（F12）是否有错误。确认 `.env.local` 配置正确。

**Q: 数据量太大，页面加载慢？**
A: 已经做了分页限制（每页12条），不应该慢。如果仍慢，检查网络连接。

**Q: 如何添加真实数据？**
A: 使用网站的投稿功能，或者直接在 SQL Editor 中 INSERT。

---

**准备好了吗？开始导入数据吧！** 🚀
