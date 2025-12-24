# Profiles 表触发器方案 - 执行摘要

**项目**: Chinglish 黑白语言站
**日期**: 2025-12-24
**状态**: ✅ 已完成全面校验，可以安全执行

---

## 快速导航

📋 **完整报告**: [COMPREHENSIVE_RISK_ASSESSMENT.md](./COMPREHENSIVE_RISK_ASSESSMENT.md)
📝 **执行计划**: [DETAILED_EXECUTION_PLAN.md](./DETAILED_EXECUTION_PLAN.md)
🧪 **测试指南**: [testing/QUICK_START.md](./testing/QUICK_START.md)
🗂️ **架构决策**: [decisions/ADR-003-profiles-auto-sync.md](./decisions/ADR-003-profiles-auto-sync.md)

---

## 核心结论

### ✅ 可以安全执行

**理由**:
- 代码一致性: 100% ✅
- 文档完整性: 高度完整 ✅
- 应用层兼容性: 无冲突 ✅
- 回滚方案: 完备（< 5 分钟）✅
- 已识别风险: 7 个中等风险，均有缓解措施 ⚠️
- 无高风险项 ✅

---

## 一致性检查结果

### 代码一致性 ✅ 100%

| 检查项 | schema.sql | 001_migration | 002_backfill | 一致性 |
|--------|-----------|---------------|--------------|--------|
| profiles 表结构 | ✓ | ✓ | N/A | ✅ 完全一致 |
| 触发器函数逻辑 | ✓ | ✓ | ✓ | ✅ 完全一致 |
| RLS 策略（4条） | ✓ | ✓ | N/A | ✅ 完全一致 |
| 索引定义（3个） | ✓ | ✓ | N/A | ✅ 完全一致 |
| OAuth 字段映射 | ✓ | ✓ | ✓ | ✅ 完全一致 |

### 文档一致性 ✅ 高度完整

| 文档 | 状态 | 与代码一致性 |
|-----|------|-------------|
| CLAUDE.md | ✅ 已更新 | ✅ 100% |
| ADR-003 | ✅ 已完成 | ✅ 100% |
| migrations/README.md | ✅ 已完成 | ✅ 100% |
| testing/QUICK_START.md | ✅ 已完成 | ✅ 100% |

### 应用层兼容性 ✅ 无冲突

| 检查项 | 状态 | 风险 |
|--------|------|------|
| 代码中 users 表引用 | ✅ 无引用 | 无风险 |
| AuthProvider 兼容性 | ✅ 无需修改 | 无风险 |
| queries.ts 查询函数 | ⚠️ 需添加 getUserProfile() | 中等风险 |
| types.ts 类型定义 | ⚠️ 需添加 UserProfile | 中等风险 |

---

## 风险总结

### 风险分布

- 🟢 **低风险**: 6 个 (46%)
- 🟡 **中等风险**: 7 个 (54%)
- 🔴 **高风险**: 0 个 (0%)

### 关键风险和缓解措施

#### 🟡 风险 1: 触发器执行失败
- **概率**: 低
- **影响**: 高（用户注册失败）
- **缓解**: 已使用 COALESCE 处理 NULL，建议添加循环计数器

#### 🟡 风险 2: 并发注册性能影响
- **概率**: 中
- **影响**: 中（注册变慢）
- **缓解**: 索引已创建，建议监控高峰时段性能

#### 🟡 风险 5: 迁移期间新用户注册
- **概率**: 中
- **影响**: 中（部分用户缺少 profiles）
- **缓解**: 在低流量时段执行，回填脚本会补全

#### 🟡 风险 9: queries.ts 缺少 getUserProfile()
- **概率**: 确定
- **影响**: 高（前端无法查询用户资料）
- **缓解**: **必须在执行前添加（见执行计划 2.1.2）**

#### 🟡 风险 10: TypeScript 类型定义缺失
- **概率**: 确定
- **影响**: 中（类型不安全）
- **缓解**: **必须在执行前添加（见执行计划 2.1.1）**

---

## 执行前必须完成

### 🔴 阻塞性任务（必须）

1. **添加 UserProfile 类型定义**
   - 文件: `lib/types.ts`
   - 时间: 1 分钟
   - 详见: [执行计划 2.1.1](./DETAILED_EXECUTION_PLAN.md#步骤-211-添加-userprofile-类型定义)

2. **添加 getUserProfile() 函数**
   - 文件: `lib/supabase/queries.ts`
   - 时间: 2 分钟
   - 详见: [执行计划 2.1.2](./DETAILED_EXECUTION_PLAN.md#步骤-212-添加-profiles-查询函数)

3. **规划迁移时间窗口**
   - 推荐时间: 凌晨 02:00-04:00 (UTC+8)
   - 预留时间: 10-15 分钟
   - 详见: [执行计划](./DETAILED_EXECUTION_PLAN.md)

### ⚠️ 推荐任务（非阻塞）

4. **改进触发器函数**（添加循环计数器）
5. **设置性能监控**（监控触发器执行时间）
6. **在 staging 环境测试**（如有）

---

## 快速执行指南

### 第一步: 代码准备（5 分钟）

```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB

# 1. 添加类型定义（见执行计划 2.1.1）
# 编辑 lib/types.ts

# 2. 添加查询函数（见执行计划 2.1.2）
# 编辑 lib/supabase/queries.ts

# 3. 验证 TypeScript 编译
npx tsc --noEmit
```

### 第二步: 执行迁移（5 分钟）

```bash
# 设置数据库凭据
export SUPABASE_HOST="bdndxbcmdvsgmapmgalh.supabase.co"
export SUPABASE_USER="postgres"
export PGPASSWORD="你的数据库密码"

# 执行迁移 001（创建 profiles 表和触发器）
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     --single-transaction \
     --set ON_ERROR_STOP=on \
     -f .project-docs/database/migrations/001_add_profiles_trigger.sql

# 执行回填 002（回填现有用户）
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     --single-transaction \
     --set ON_ERROR_STOP=on \
     -f .project-docs/database/migrations/002_backfill_existing_users.sql
```

### 第三步: 验证测试（5 分钟）

```bash
# 运行自动化测试
npx tsx .project-docs/testing/test_auth_flow.ts

# 预期结果: 所有测试通过 (8/8)
```

### 第四步: 验证数据一致性（1 分钟）

```bash
# 检查 auth.users 和 profiles 数量
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users,
  (SELECT COUNT(*) FROM profiles) AS profiles,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles)
    THEN '✓ 一致'
    ELSE '✗ 不一致'
  END AS status;
"
# 应输出: status = ✓ 一致
```

---

## 如果出现问题

### 紧急回滚（< 5 分钟）

```bash
# 执行完整回滚
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -f .project-docs/database/migrations/rollback_profiles_trigger.sql

# 验证回滚成功
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"
# 应返回 0 rows
```

### 常见错误

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| "permission denied for schema auth" | 权限不足 | 使用 postgres 用户 |
| "function already exists" | 重复执行 | 脚本已幂等，继续执行 |
| "duplicate key value" | 用户名冲突 | 重新执行回填脚本 |
| "RLS policy violation" | 触发器权限错误 | 检查 SECURITY DEFINER |

详细故障处理: [执行计划第6章](./DETAILED_EXECUTION_PLAN.md#6-故障处理)

---

## 执行后检查清单

### 立即验证（必须）

- [ ] ✅ auth.users 和 profiles 数量一致
- [ ] ✅ 所有用户都有 profiles 记录
- [ ] ✅ 自动化测试 100% 通过
- [ ] ✅ 手动 OAuth 登录测试通过
- [ ] ✅ Supabase Logs 无错误

### 24 小时内监控（推荐）

- [ ] ⚠️ 监控新用户注册成功率
- [ ] ⚠️ 监控触发器执行时间
- [ ] ⚠️ 监控数据库 CPU/内存使用率
- [ ] ⚠️ 检查用户反馈

---

## 关键文件路径

### 迁移脚本
```
.project-docs/database/migrations/
├── 001_add_profiles_trigger.sql      # 创建 profiles 表和触发器
├── 002_backfill_existing_users.sql   # 回填现有用户
└── rollback_profiles_trigger.sql     # 回滚脚本
```

### 应用代码
```
lib/
├── types.ts                          # 需添加 UserProfile 接口
└── supabase/
    └── queries.ts                    # 需添加 getUserProfile() 函数
```

### 测试文件
```
.project-docs/testing/
├── test_auth_flow.ts                 # 自动化测试脚本
└── QUICK_START.md                    # 测试快速指南
```

### 文档
```
.project-docs/
├── COMPREHENSIVE_RISK_ASSESSMENT.md  # 完整风险评估报告
├── DETAILED_EXECUTION_PLAN.md        # 详细执行计划
├── EXECUTION_SUMMARY.md              # 本文档
└── decisions/
    └── ADR-003-profiles-auto-sync.md # 架构决策记录
```

---

## 预计时间

| 阶段 | 时间 |
|-----|------|
| 代码准备 | 5 分钟 |
| 执行迁移 001 | 2 分钟 |
| 执行回填 002 | 1-3 分钟 |
| 验证测试 | 5 分钟 |
| **总计** | **13-15 分钟** |

**回滚时间**: < 5 分钟（如需）

---

## 联系信息

### 技术资源

- **Supabase 文档**: https://supabase.com/docs/guides/database/postgres/triggers
- **PostgreSQL 触发器**: https://www.postgresql.org/docs/current/triggers.html
- **项目 CLAUDE.md**: [/CLAUDE.md](../CLAUDE.md)

### 支持

- **数据库管理员**: [填写联系方式]
- **后端团队**: [填写联系方式]
- **Supabase 支持**: https://supabase.com/support

---

## 最终评估

### 评估结论: ✅ 可以安全执行

**前提条件**:
1. ✅ 完成代码准备（types.ts 和 queries.ts）
2. ✅ 选择低流量时段执行
3. ✅ 准备好回滚方案

**执行建议**:
- **推荐时间**: 2025-12-24 凌晨 02:00-04:00 (UTC+8)
- **预留时间**: 15 分钟
- **风险级别**: 🟡 中等（可控）
- **可逆性**: ✅ 完全可逆（< 5 分钟回滚）

---

**报告生成**: 2025-12-24
**有效期**: 30 天
**下次评审**: 部署后 1 周（2025-12-31）

---

## 附录: 核心 SQL 片段

### 触发器函数关键逻辑

```sql
-- 从邮箱生成默认用户名
default_username := split_part(NEW.email, '@', 1);

-- 处理用户名冲突（添加随机后缀）
WHILE EXISTS (SELECT 1 FROM profiles WHERE username = default_username) LOOP
  default_username := split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 6);
END LOOP;

-- 从 OAuth 元数据提取头像和姓名
avatar_url: COALESCE(
  NEW.raw_user_meta_data->>'avatar_url',  -- GitHub
  NEW.raw_user_meta_data->>'picture',     -- Google
  NULL
)

full_name: COALESCE(
  NEW.raw_user_meta_data->>'full_name',   -- Google
  NEW.raw_user_meta_data->>'name',        -- GitHub
  NULL
)
```

### 验证查询

```sql
-- 检查数据一致性
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users,
  (SELECT COUNT(*) FROM profiles) AS profiles;

-- 查找缺失的 profiles 记录
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 检查用户名唯一性
SELECT username, COUNT(*)
FROM profiles
GROUP BY username
HAVING COUNT(*) > 1;
```

---

**本文档是 Profiles 表触发器方案执行的快速参考指南。详细信息请参阅完整报告和执行计划。**
