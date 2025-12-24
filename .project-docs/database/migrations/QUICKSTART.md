# Quick Start - 快速执行指南

## 最快速的执行方式（推荐）

### 方法 1: 使用 Supabase Dashboard（最简单，推荐）

1. **打开 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/YOUR-PROJECT-ID/sql
   ```

2. **执行迁移脚本**（按顺序复制粘贴）

   **步骤 1：创建 profiles 表和触发器**
   - 打开文件：`001_add_profiles_trigger.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" (或按 Ctrl+Enter)
   - 等待执行完成（约 2-3 秒）

   **步骤 2：回填现有用户**
   - 打开文件：`002_backfill_existing_users.sql`
   - 复制全部内容
   - 粘贴到 SQL Editor
   - 点击 "Run" (或按 Ctrl+Enter)
   - 查看输出统计信息

3. **验证结果**
   ```sql
   -- 在 SQL Editor 中运行
   SELECT COUNT(*) as profiles_count FROM public.profiles;
   SELECT COUNT(*) as auth_users_count FROM auth.users;

   -- 两个数字应该相等
   ```

---

### 方法 2: 使用命令行脚本

```bash
# 1. 设置数据库连接
export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'

# 2. 执行迁移
cd .project-docs/database/migrations
bash execute-migrations.sh migrate

# 3. 验证
bash execute-migrations.sh verify
```

---

### 方法 3: 使用 Supabase CLI

```bash
# 1. 登录 Supabase
supabase login

# 2. 链接到项目
supabase link --project-ref YOUR-PROJECT-REF

# 3. 执行迁移
supabase db push --file .project-docs/database/migrations/001_add_profiles_trigger.sql
supabase db push --file .project-docs/database/migrations/002_backfill_existing_users.sql
```

---

## 执行检查清单

### 执行前检查

- [ ] 已备份数据库（可选，但推荐）
- [ ] 确认有 service_role 权限
- [ ] 确认 Supabase 项目正在运行

### 执行步骤

- [ ] 执行 `001_add_profiles_trigger.sql`
- [ ] 检查是否有错误（应该没有）
- [ ] 执行 `002_backfill_existing_users.sql`
- [ ] 查看输出统计信息

### 执行后验证

- [ ] 检查 profiles 表是否存在
- [ ] 检查 profiles 表记录数 = auth.users 记录数
- [ ] 检查触发器是否创建
- [ ] 测试新用户注册（应自动创建 profiles 记录）
- [ ] 测试前端用户资料获取功能

---

## 常用验证查询

```sql
-- 1. 检查表是否存在
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. 检查用户数据
SELECT
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles,
    (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) as synced;

-- 3. 查看 profiles 数据
SELECT id, email, username, avatar_url, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. 检查触发器
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. 查找缺失的 profiles
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

---

## 常见问题快速解决

### Q: 执行时报错 "permission denied"
**A:** 确保在 Supabase Dashboard 的 SQL Editor 中执行（自动使用 service_role）

### Q: 部分用户没有 profiles 记录
**A:** 重新执行 `002_backfill_existing_users.sql`（脚本是幂等的，安全）

### Q: 触发器没有自动创建 profiles
**A:** 检查触发器是否存在：
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
```

### Q: 需要回滚
**A:** 执行 `rollback_profiles_trigger.sql`（警告：会删除所有 profiles 数据）

---

## 时间估算

- **执行时间**: 约 30 秒（取决于现有用户数）
- **验证时间**: 约 2 分钟
- **总耗时**: 约 5 分钟

---

## 支持

遇到问题？检查：
1. [README.md](./README.md) - 完整文档
2. [Supabase Logs](https://supabase.com/dashboard/project/_/logs) - 数据库日志
3. [GitHub Issues](https://github.com/your-repo/issues) - 提交问题

---

**最后更新**: 2025-12-24
