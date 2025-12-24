# Database Migrations - Profiles 表修复

本目录包含用于修复 Chinglish WB 项目用户认证和 profiles 表同步问题的 SQL 迁移脚本。

## 问题背景

**症状：**
- Google OAuth 登录成功后，`auth.users` 表中有用户记录
- 但 `public.profiles` 表中没有对应的记录
- 导致前端无法获取用户资料，显示认证错误

**根本原因：**
- 缺少数据库触发器来自动同步 `auth.users` → `public.profiles`
- 现有用户（已在 `auth.users` 中）没有对应的 `profiles` 记录

## 迁移文件说明

### 1. `001_add_profiles_trigger.sql` (主迁移脚本)

**功能：**
- 创建 `public.profiles` 表（如果不存在）
- 设置表结构、索引、约束
- 启用 Row Level Security (RLS)
- 配置 RLS 策略（所有人可查看，用户只能更新自己的资料）
- 创建触发器函数 `handle_new_user()`
- 创建触发器 `on_auth_user_created`（监听 `auth.users` 的 INSERT 事件）

**特性：**
- 幂等性：可以安全地重复执行
- 自动提取 OAuth 用户信息（头像、姓名）
- 自动生成唯一用户名（从邮箱提取，冲突时添加随机后缀）
- `SECURITY DEFINER`：触发器以创建者权限执行，绕过 RLS

**执行顺序：** 第一步

### 2. `002_backfill_existing_users.sql` (数据回填脚本)

**功能：**
- 为所有现有 `auth.users` 记录创建对应的 `profiles` 记录
- 只插入尚未存在的用户（避免重复）
- 从 `raw_user_meta_data` 提取 OAuth 信息

**统计输出：**
- `auth.users` 总用户数
- `profiles` 当前记录数
- 本次回填创建的记录数
- 数据完整性检查结果

**执行顺序：** 第二步（在 001 之后）

### 3. `rollback_profiles_trigger.sql` (回滚脚本)

**功能：**
- 安全地撤销 profiles 表和触发器的所有配置
- 删除触发器、函数、RLS 策略
- 删除 `profiles` 表（包括所有数据）

**警告：**
- ⚠️ 此操作将删除所有用户资料数据
- ⚠️ 不会影响 `auth.users` 表
- 仅在需要完全重新开始时使用

**执行顺序：** 仅在需要回滚时执行

## 使用方法

### 在 Supabase Dashboard 中执行

1. **登录 Supabase Dashboard**
   - 访问 https://supabase.com/dashboard
   - 选择你的项目

2. **打开 SQL Editor**
   - 左侧菜单 → "SQL Editor" → "New query"

3. **执行迁移脚本（按顺序）**

   **步骤 1：创建 profiles 表和触发器**
   ```sql
   -- 复制 001_add_profiles_trigger.sql 的全部内容
   -- 粘贴到 SQL Editor
   -- 点击 "Run" 或按 Ctrl+Enter
   ```

   **步骤 2：回填现有用户**
   ```sql
   -- 复制 002_backfill_existing_users.sql 的全部内容
   -- 粘贴到 SQL Editor
   -- 点击 "Run" 或按 Ctrl+Enter
   ```

4. **检查执行结果**
   - 查看 "Results" 面板中的输出信息
   - 确认统计数字正确
   - 检查是否有 WARNING 或 ERROR

### 使用 Supabase CLI (可选)

```bash
# 连接到 Supabase 项目
supabase db reset

# 或者直接执行单个文件
supabase db push --file .project-docs/database/migrations/001_add_profiles_trigger.sql
supabase db push --file .project-docs/database/migrations/002_backfill_existing_users.sql
```

### 使用 psql (本地开发)

```bash
# 连接到本地 Supabase 数据库
psql postgresql://postgres:postgres@localhost:54322/postgres

# 执行迁移
\i .project-docs/database/migrations/001_add_profiles_trigger.sql
\i .project-docs/database/migrations/002_backfill_existing_users.sql
```

## 验证迁移成功

### 1. 检查 profiles 表是否创建

```sql
-- 查询 profiles 表结构
\d public.profiles

-- 或在 Supabase Dashboard 中
SELECT * FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'profiles';
```

### 2. 检查触发器是否创建

```sql
-- 查看触发器
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 查看触发器函数
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';
```

### 3. 检查数据同步

```sql
-- 统计用户数
SELECT
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count;

-- 查看 profiles 数据
SELECT id, email, username, avatar_url, full_name, created_at
FROM public.profiles
LIMIT 10;
```

### 4. 测试触发器

```sql
-- 方法1：使用 Supabase Dashboard 注册新用户
-- 然后检查 profiles 表是否自动创建记录

-- 方法2：模拟插入（需要 service_role 权限）
-- 注意：这只是测试，实际用户注册应通过 Supabase Auth API
```

### 5. 测试 RLS 策略

```sql
-- 作为匿名用户查询（应该成功）
SELECT * FROM public.profiles LIMIT 5;

-- 作为认证用户更新自己的资料（应该成功）
-- 需要在客户端代码中测试

-- 作为认证用户更新其他人的资料（应该失败）
-- 需要在客户端代码中测试
```

## 常见问题

### Q1: 执行 001 脚本时报错 "permission denied"

**原因：** 没有足够的权限创建触发器或访问 `auth` schema

**解决方案：**
- 确保使用 **service_role** 权限执行脚本
- 在 Supabase Dashboard 的 SQL Editor 中执行（自动使用 service_role）
- 或者在 `.env.local` 中使用 `SUPABASE_SERVICE_ROLE_KEY`

### Q2: 执行 002 脚本后，部分用户没有 profiles 记录

**原因：** 可能是用户名冲突或数据完整性问题

**解决方案：**
1. 查看脚本输出的 WARNING 信息
2. 检查是否有重复的邮箱或用户名
3. 手动插入缺失的记录：

```sql
-- 查找缺失的用户
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 手动插入（修改 ID 和邮箱）
INSERT INTO public.profiles (id, email, username, created_at, updated_at)
VALUES (
  'user-uuid-here',
  'user@example.com',
  'username_here',
  NOW(),
  NOW()
);
```

### Q3: 触发器没有自动创建 profiles 记录

**检查步骤：**

1. **确认触发器存在**
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

2. **确认触发器函数存在**
```sql
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```

3. **检查触发器是否启用**
```sql
SELECT tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- tgenabled 应该是 'O' (enabled)
```

4. **查看 PostgreSQL 日志**
- Supabase Dashboard → "Logs" → "Postgres Logs"
- 查找与 `handle_new_user` 相关的错误

### Q4: 如何重新运行迁移？

**场景1：迁移失败，需要从头开始**
```bash
# 1. 执行回滚脚本
psql -f rollback_profiles_trigger.sql

# 2. 重新执行迁移
psql -f 001_add_profiles_trigger.sql
psql -f 002_backfill_existing_users.sql
```

**场景2：仅需要重新回填数据**
```bash
# 直接执行回填脚本（会跳过已存在的记录）
psql -f 002_backfill_existing_users.sql
```

### Q5: 如何修改 profiles 表结构？

**步骤：**

1. **创建新的迁移文件**
```bash
touch 003_alter_profiles_add_column.sql
```

2. **编写 ALTER TABLE 语句**
```sql
-- 示例：添加新字段
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
```

3. **更新触发器函数**（如果需要）
```sql
-- 修改 handle_new_user() 函数，添加新字段的默认值
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
-- ... (添加新字段的处理逻辑)
```

## 回滚步骤

如果需要完全撤销迁移（⚠️ 警告：将删除所有 profiles 数据）：

```sql
-- 在 Supabase SQL Editor 中执行
\i .project-docs/database/migrations/rollback_profiles_trigger.sql
```

或直接复制 `rollback_profiles_trigger.sql` 的内容到 SQL Editor 执行。

## 下一步

迁移成功后：

1. **更新前端代码**
   - 使用 `lib/supabase/queries.ts` 中的 `getUserProfile()` 函数
   - 检查用户登录后是否能正确获取资料

2. **测试用户注册流程**
   - 注册新用户（邮箱/密码）
   - Google OAuth 登录
   - 检查 profiles 表是否自动创建记录

3. **部署到生产环境**
   - 在生产 Supabase 项目中执行相同的迁移脚本
   - 监控触发器是否正常工作

4. **更新文档**
   - 在 `CLAUDE.md` 中记录 profiles 表的使用方法
   - 更新 API 文档（如果有）

## 相关文件

- **Schema 定义**: [.project-docs/database/schema.sql](../schema.sql)
- **Supabase 设置指南**: [.project-docs/database/SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- **类型定义**: [lib/types.ts](../../../lib/types.ts)
- **数据库查询**: [lib/supabase/queries.ts](../../../lib/supabase/queries.ts)

## 联系方式

如有问题，请查看：
- [项目文档](.project-docs/)
- [GitHub Issues](https://github.com/your-repo/issues)
- [Supabase 官方文档](https://supabase.com/docs)

---

**最后更新：** 2025-12-24
**版本：** 1.0.0
