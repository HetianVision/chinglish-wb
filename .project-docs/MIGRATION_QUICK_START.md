# Profiles 表触发器迁移 - 快速开始指南

**推荐执行时间**: 周末凌晨 2-4 AM
**预计总时间**: 10-15 分钟
**风险等级**: 🟢 低风险 (综合评分: 1.8/10)

---

## 一、执行前准备 (2 分钟)

### 设置数据库连接

```bash
# 从 Supabase Dashboard → Settings → Database → Connection String 获取
export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'
```

### 验证环境

```bash
# 检查连接
psql $SUPABASE_DB_URL -c "SELECT version();"

# 查看用户数量（估算回填时间）
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM auth.users;"
```

---

## 二、执行迁移 (3 分钟)

### 方法 1: 一键自动化执行（推荐）

```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/database/migrations
bash execute-migrations.sh migrate
```

**预期输出**:
- ✅ 创建 profiles 表和触发器
- ✅ 回填现有用户
- ✅ 显示同步统计

### 方法 2: 手动逐步执行

```bash
# 步骤 1: 创建表和触发器
psql $SUPABASE_DB_URL -f 001_add_profiles_trigger.sql

# 步骤 2: 回填现有用户
psql $SUPABASE_DB_URL -f 002_backfill_existing_users.sql
```

---

## 三、验证成功 (2 分钟)

### 快速验证

```bash
# 方法 1: 使用自动化脚本
bash execute-migrations.sh verify

# 方法 2: 手动检查
psql $SUPABASE_DB_URL -c "
  SELECT
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as diff;
"
```

**预期结果**: `diff = 0` (完全同步)

### 测试触发器

```bash
# 创建测试用户（通过前端注册或使用 Supabase Dashboard）
# 然后检查是否自动创建了 profiles 记录
psql $SUPABASE_DB_URL -c "
  SELECT au.email, p.username, p.created_at
  FROM auth.users au
  JOIN profiles p ON au.id = p.id
  ORDER BY au.created_at DESC
  LIMIT 3;
"
```

---

## 四、紧急回滚 (如需要，2 分钟)

### 触发回滚的条件

⚠️ 在以下情况下立即回滚：
- 触发器执行失败率 > 10%
- 数据不一致 (diff > 10)
- 数据库 CPU > 80% 持续
- 前端功能完全中断

### 执行回滚

```bash
cd .project-docs/database/migrations
bash execute-migrations.sh rollback
```

### 验证回滚

```bash
psql $SUPABASE_DB_URL -c "
  SELECT tablename FROM pg_tables WHERE tablename = 'profiles';
"
# 预期: 0 rows (表已删除)
```

---

## 五、常见问题

### Q1: 迁移脚本卡住不动

**原因**: 可能是数据库连接问题或权限不足

**解决**:
```bash
# 检查连接
psql $SUPABASE_DB_URL -c "SELECT 1;"

# 检查权限
psql $SUPABASE_DB_URL -c "SELECT has_schema_privilege('public', 'CREATE');"
```

### Q2: 回填后数据不一致 (diff > 0)

**原因**: 回填执行期间有新用户注册

**解决**: 重新运行回填脚本（幂等，可安全重复执行）
```bash
psql $SUPABASE_DB_URL -f 002_backfill_existing_users.sql
```

### Q3: 触发器未自动执行

**原因**: 触发器可能被禁用或删除

**解决**:
```bash
# 检查触发器是否存在
psql $SUPABASE_DB_URL -c "
  SELECT trigger_name FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
"

# 如果不存在，重新执行 001 脚本
psql $SUPABASE_DB_URL -f 001_add_profiles_trigger.sql
```

---

## 六、成功标准清单

迁移成功的标志：

- [x] ✅ 脚本执行无 ERROR 输出
- [x] ✅ `auth.users` 和 `profiles` 数量相等
- [x] ✅ 新用户注册自动创建 profiles
- [x] ✅ Google OAuth 用户头像正确显示
- [x] ✅ 前端登录/注册功能正常
- [x] ✅ Supabase Dashboard 无异常日志

---

## 七、关键文件位置

```
/Users/wangfei/Documents/VibeCodinig/ChinglishWB/
├── .project-docs/
│   ├── RISK_ASSESSMENT.md          # 风险评估报告（详细）
│   ├── EXECUTION_PLAN.md           # 执行计划（完整）
│   ├── MIGRATION_QUICK_START.md    # 本文档（快速）
│   └── database/
│       ├── migrations/
│       │   ├── execute-migrations.sh    # 自动化执行脚本
│       │   ├── 001_add_profiles_trigger.sql
│       │   ├── 002_backfill_existing_users.sql
│       │   └── rollback_profiles_trigger.sql
│       └── tests/
│           └── verify_profiles_sync.sql  # 验证脚本
```

---

## 八、执行时间估算

| 用户数量 | 001 脚本 | 002 脚本 | 验证 | 总计 |
|---------|---------|---------|------|------|
| < 100 | 30 秒 | 1 秒 | 30 秒 | **2 分钟** |
| 100-1,000 | 30 秒 | 5 秒 | 30 秒 | **2 分钟** |
| 1,000-10,000 | 30 秒 | 20 秒 | 30 秒 | **3 分钟** |
| 10,000-100,000 | 30 秒 | 2 分钟 | 30 秒 | **5 分钟** |

---

## 九、监控要点 (首 24 小时)

### 第 1 小时: 密集监控

- **每 10 分钟**: 检查 Supabase Dashboard → Logs
- **搜索关键词**: `handle_new_user`, `ERROR`
- **检查指标**: auth.users 和 profiles 数量差异

### 第 1-24 小时: 定期检查

- **每 6 小时**: 运行验证脚本
- **观察**: 用户反馈、错误报告
- **关注**: 数据库性能指标 (CPU, 内存)

---

## 十、联系和帮助

**详细文档**:
- 完整执行计划: `.project-docs/EXECUTION_PLAN.md`
- 风险评估报告: `.project-docs/RISK_ASSESSMENT.md`
- ADR 决策文档: `.project-docs/decisions/ADR-003-profiles-auto-sync.md`

**Supabase 资源**:
- Dashboard: https://app.supabase.com
- 文档: https://supabase.com/docs/guides/database/postgres/triggers

**紧急情况**:
- 立即执行回滚: `bash execute-migrations.sh rollback`
- 检查日志: Supabase Dashboard → Database → Logs
- 联系团队负责人

---

**最后更新**: 2025-12-24
**文档版本**: v1.0

🚀 **准备就绪？开始执行迁移！**
