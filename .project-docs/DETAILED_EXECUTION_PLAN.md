# Profiles 表触发器方案 - 详细执行计划

**项目**: Chinglish 黑白语言站
**计划日期**: 2025-12-24
**预计执行时间**: 10-15 分钟
**维护窗口**: 凌晨 02:00-04:00 (UTC+8)

---

## 目录

1. [执行概览](#1-执行概览)
2. [前置准备](#2-前置准备)
3. [详细执行步骤](#3-详细执行步骤)
4. [验证检查](#4-验证检查)
5. [回滚方案](#5-回滚方案)
6. [故障处理](#6-故障处理)
7. [执行后清单](#7-执行后清单)

---

## 1. 执行概览

### 1.1 目标

将 Chinglish WB 项目的用户认证系统升级为自动同步机制：
- 在 `auth.users` 表插入新用户时，自动在 `public.profiles` 表创建对应记录
- 回填所有现有用户到 `profiles` 表
- 确保 OAuth 登录（Google、GitHub 等）的用户数据完整性

### 1.2 涉及的数据库对象

| 对象类型 | 名称 | 操作 |
|---------|------|------|
| 表 | `public.profiles` | 创建 |
| 函数 | `public.handle_new_user()` | 创建 |
| 触发器 | `on_auth_user_created` | 创建（在 auth.users 上） |
| RLS 策略 | 4 条策略 | 创建 |
| 索引 | 3 个索引 | 创建 |
| 数据迁移 | profiles 回填 | 执行 |

### 1.3 执行阶段

```
阶段 1: 前置准备 (10 分钟)
  ├── 代码更新
  ├── 数据库连接测试
  └── 备份确认

阶段 2: 执行迁移 001 (2 分钟)
  ├── 创建 profiles 表
  ├── 创建触发器函数
  ├── 创建触发器
  └── 设置 RLS

阶段 3: 执行回填 002 (1-3 分钟)
  ├── 回填现有用户
  ├── 验证数据一致性
  └── 检查用户名唯一性

阶段 4: 验证测试 (5 分钟)
  ├── 运行自动化测试
  ├── 手动测试 OAuth 登录
  └── 检查日志

阶段 5: 后续清理 (可选)
  └── 清理测试数据
```

### 1.4 风险级别

- **整体风险**: 🟡 中等
- **回滚难度**: 🟢 低（< 5 分钟）
- **影响范围**: 🟡 中等（用户认证流程）
- **可逆性**: ✅ 完全可逆

---

## 2. 前置准备

### 2.1 代码更新（必须）

#### 步骤 2.1.1: 添加 UserProfile 类型定义

**文件**: `/Users/wangfei/Documents/VibeCodinig/ChinglishWB/lib/types.ts`

**操作**: 在文件末尾添加以下代码

```typescript
// 用户资料类型定义
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  fullName?: string;
  contributionLevel: number;
  badges: string[];
  createdAt: string;
  updatedAt: string;
}
```

**验证命令**:
```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
npx tsc --noEmit
# 应无错误输出
```

**预期结果**: TypeScript 编译通过

**预计时间**: 1 分钟

---

#### 步骤 2.1.2: 添加 profiles 查询函数

**文件**: `/Users/wangfei/Documents/VibeCodinig/ChinglishWB/lib/supabase/queries.ts`

**操作**: 在文件末尾添加以下代码

```typescript
/**
 * 获取用户资料
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }

  return { data: transformProfileFromDB(data), error: null };
}

/**
 * 更新用户资料
 */
export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<UserProfile, 'username' | 'avatarUrl' | 'fullName'>>
) {
  // 转换为数据库字段格式
  const dbUpdates: any = {};
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }

  return { data: transformProfileFromDB(data), error: null };
}

/**
 * 将数据库 profile 字段转换为 TypeScript 类型
 */
function transformProfileFromDB(dbProfile: any): UserProfile {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    username: dbProfile.username,
    avatarUrl: dbProfile.avatar_url,
    fullName: dbProfile.full_name,
    contributionLevel: dbProfile.contribution_level,
    badges: dbProfile.badges || [],
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at,
  };
}
```

**验证命令**:
```bash
npx tsc --noEmit
# 应无错误输出
```

**预期结果**: TypeScript 编译通过，新函数可用

**预计时间**: 2 分钟

---

#### 步骤 2.1.3: 更新 types.ts 导入（可选）

**文件**: `/Users/wangfei/Documents/VibeCodinig/ChinglishWB/lib/supabase/queries.ts`

**操作**: 在文件顶部添加导入

```typescript
import { TermEntry, Submission, UserProfile } from '@/lib/types';
```

**预计时间**: 1 分钟

---

### 2.2 环境准备（必须）

#### 步骤 2.2.1: 验证环境变量

**操作**:
```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
cat .env.local
```

**预期输出**:
```
NEXT_PUBLIC_SUPABASE_URL=https://bdndxbcmdvsgmapmgalh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_***
SUPABASE_SERVICE_ROLE_KEY=sb_secret_***
ADMIN_TOKEN=***
```

**检查项**:
- [x] SUPABASE_URL 正确
- [x] ANON_KEY 有效
- [x] SERVICE_ROLE_KEY 有效

**预计时间**: 1 分钟

---

#### 步骤 2.2.2: 测试数据库连接

**操作**:
```bash
# 使用 psql 连接 Supabase
export PGPASSWORD="你的数据库密码"
psql -h bdndxbcmdvsgmapmgalh.supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT current_database(), current_user;"
```

**预期输出**:
```
 current_database | current_user
------------------+--------------
 postgres         | postgres
(1 row)
```

**如果无法连接**:
1. 检查 Supabase 项目状态（是否暂停）
2. 检查网络连接
3. 确认数据库密码正确

**预计时间**: 2 分钟

---

#### 步骤 2.2.3: 确认数据库备份

**操作**: 访问 Supabase Dashboard

1. 登录 https://supabase.com/dashboard
2. 选择项目 `bdndxbcmdvsgmapmgalh`
3. 导航到 **Database** → **Backups**
4. 确认最近的自动备份时间

**预期结果**: 最近 24 小时内有备份记录

**注意**: Supabase 免费计划提供 7 天的自动备份

**预计时间**: 2 分钟

---

### 2.3 迁移脚本准备（必须）

#### 步骤 2.3.1: 验证迁移脚本存在

**操作**:
```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
ls -lh .project-docs/database/migrations/
```

**预期输出**:
```
-rw-r--r--  001_add_profiles_trigger.sql
-rw-r--r--  002_backfill_existing_users.sql
-rw-r--r--  rollback_profiles_trigger.sql
-rw-r--r--  README.md
-rw-r--r--  QUICKSTART.md
```

**检查项**:
- [x] 001_add_profiles_trigger.sql 存在
- [x] 002_backfill_existing_users.sql 存在
- [x] rollback_profiles_trigger.sql 存在

**预计时间**: 1 分钟

---

#### 步骤 2.3.2: 语法检查（推荐）

**操作**:
```bash
# 使用 psql 的 dry-run 模式检查语法
psql -h bdndxbcmdvsgmapmgalh.supabase.co \
     -U postgres \
     -d postgres \
     --single-transaction \
     --set ON_ERROR_STOP=on \
     -f .project-docs/database/migrations/001_add_profiles_trigger.sql \
     --dry-run
```

**预期结果**: 无语法错误

**注意**: `--dry-run` 可能不被 Supabase 支持，如果报错请跳过此步骤

**预计时间**: 1 分钟

---

### 2.4 通知和协调（推荐）

#### 步骤 2.4.1: 通知团队成员

**操作**: 发送通知邮件/消息

**内容模板**:
```
主题: [维护通知] Chinglish WB 数据库迁移

时间: 2025-12-24 02:00-02:15 (UTC+8)
影响: 用户注册/登录功能可能短暂不可用（< 5 分钟）
操作: Profiles 表触发器部署
回滚时间: < 5 分钟

详情: 见 EXECUTION_PLAN.md
```

**预计时间**: 2 分钟

---

### 2.5 前置准备检查清单

- [ ] ✅ types.ts 添加 UserProfile 接口
- [ ] ✅ queries.ts 添加 getUserProfile() 函数
- [ ] ✅ queries.ts 添加 updateUserProfile() 函数
- [ ] ✅ TypeScript 编译通过
- [ ] ✅ 环境变量已确认
- [ ] ✅ 数据库连接测试通过
- [ ] ✅ 数据库备份已确认
- [ ] ✅ 迁移脚本文件存在
- [ ] ⚠️ 团队成员已通知（可选）
- [ ] ⚠️ 确定执行时间窗口

**总预计时间**: 10 分钟

---

## 3. 详细执行步骤

### 阶段 1: 执行迁移脚本 001

#### 步骤 3.1: 进入项目目录

**操作**:
```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
```

**预计时间**: 10 秒

---

#### 步骤 3.2: 设置数据库凭据

**操作**:
```bash
# 设置环境变量（避免密码泄露到命令历史）
export SUPABASE_HOST="bdndxbcmdvsgmapmgalh.supabase.co"
export SUPABASE_USER="postgres"
export PGPASSWORD="你的数据库密码"
```

**验证**:
```bash
echo $SUPABASE_HOST
# 应输出: bdndxbcmdvsgmapmgalh.supabase.co
```

**预计时间**: 30 秒

---

#### 步骤 3.3: 执行迁移 001（创建 profiles 表和触发器）

**操作**:
```bash
psql -h $SUPABASE_HOST \
     -U $SUPABASE_USER \
     -d postgres \
     --single-transaction \
     --set ON_ERROR_STOP=on \
     -f .project-docs/database/migrations/001_add_profiles_trigger.sql
```

**预期输出**:
```
CREATE TABLE
COMMENT
COMMENT
COMMENT
...
CREATE INDEX
CREATE INDEX
CREATE INDEX
ALTER TABLE
CREATE POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
DROP TRIGGER
CREATE TRIGGER
CREATE FUNCTION
COMMENT
DROP TRIGGER
CREATE TRIGGER
COMMENT
GRANT
GRANT
```

**关键检查点**:
- ✅ 无 ERROR 消息
- ✅ 看到 "CREATE TABLE"
- ✅ 看到 "CREATE TRIGGER on_auth_user_created"
- ✅ 看到 "CREATE FUNCTION handle_new_user"

**如果出错**: 见 [6. 故障处理](#6-故障处理)

**预计时间**: 1-2 分钟

---

#### 步骤 3.4: 验证迁移 001 结果

**操作**:
```bash
# 检查 profiles 表是否创建
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"
```

**预期输出**:
```
 tablename
-----------
 profiles
(1 row)
```

**验证触发器**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';"
```

**预期输出**:
```
       tgname
---------------------
 on_auth_user_created
(1 row)
```

**验证函数**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';"
```

**预期输出**:
```
    proname
-----------------
 handle_new_user
(1 row)
```

**预计时间**: 1 分钟

---

### 阶段 2: 执行回填脚本 002

#### 步骤 3.5: 检查现有用户数量

**操作**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT COUNT(*) AS auth_users_count FROM auth.users;"
```

**预期输出**:
```
 auth_users_count
------------------
               5  (示例数字)
(1 row)
```

**记录此数字**: _________ (将在后续验证中使用)

**预计时间**: 30 秒

---

#### 步骤 3.6: 执行回填脚本 002

**操作**:
```bash
psql -h $SUPABASE_HOST \
     -U $SUPABASE_USER \
     -d postgres \
     --single-transaction \
     --set ON_ERROR_STOP=on \
     -f .project-docs/database/migrations/002_backfill_existing_users.sql
```

**预期输出**:
```
DO
INSERT 0 5  (数字取决于现有用户数)
DO
NOTICE:  ========================================
NOTICE:  回填统计：
NOTICE:    auth.users 总用户数: 5
NOTICE:    profiles 当前记录数: 5
NOTICE:    本次回填创建记录数: 5
NOTICE:  ========================================
NOTICE:  ✓ 同步完成：所有 auth.users 都有对应的 profiles 记录
DO
NOTICE:  ✓ 数据完整性检查通过：所有用户都有对应的 profiles 记录
DO
NOTICE:  ✓ 用户名唯一性检查通过
```

**关键检查点**:
- ✅ 看到 "同步完成" 消息
- ✅ auth.users 数量 == profiles 数量
- ✅ 数据完整性检查通过
- ✅ 用户名唯一性检查通过

**如果看到警告**: 见 [6. 故障处理](#6-故障处理)

**预计时间**: 1-3 分钟（取决于用户数量）

---

#### 步骤 3.7: 验证回填结果

**操作**:
```bash
# 检查 profiles 表记录数
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT COUNT(*) AS profiles_count FROM profiles;"
```

**预期输出**:
```
 profiles_count
----------------
             5  (应与 auth.users 数量相同)
(1 row)
```

**验证数据完整性**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT au.id, au.email, p.username, p.full_name, p.avatar_url
         FROM auth.users au
         LEFT JOIN profiles p ON au.id = p.id
         LIMIT 5;"
```

**预期输出**:
```
                  id                  |       email       |   username   | full_name  | avatar_url
--------------------------------------+-------------------+--------------+------------+------------
 12345678-1234-1234-1234-123456789012 | user1@example.com | user1        | John Doe   | https://...
 ...
```

**检查项**:
- ✅ 所有行的 `username` 字段有值（不为 NULL）
- ✅ 部分行的 `full_name` 和 `avatar_url` 有值（OAuth 用户）
- ✅ 没有行的 `username` 字段为 NULL

**预计时间**: 1 分钟

---

### 阶段 3: 功能验证测试

#### 步骤 3.8: 运行自动化测试脚本

**操作**:
```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
npx tsx .project-docs/testing/test_auth_flow.ts
```

**预期输出**:
```
╔═══════════════════════════════════════════════════════════════╗
║     Chinglish WB - Profiles 表认证流程自动化测试              ║
╚═══════════════════════════════════════════════════════════════╝

[Test 1] 检查环境配置
✓ NEXT_PUBLIC_SUPABASE_URL 已配置
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY 已配置
✓ SUPABASE_SERVICE_ROLE_KEY 已配置

[Test 2] 检查 profiles 表结构
✓ profiles 表可以正常访问

[Test 3] 检查数据一致性
✓ profiles 表包含 5 条记录

[Test 4] 测试邮箱注册流程
✓ 用户创建成功 (ID: xxx) (2500ms)

[Test 5] 验证 profiles 记录自动创建
✓ id 匹配: xxx
✓ email 匹配: test-xxx@chinglishwb-test.com
✓ profiles 记录正确创建并同步 (150ms)

[Test 6] 测试 RLS 读取权限
✓ 用户可以读取自己的 profile (120ms)

[Test 7] 测试 RLS 更新权限
✓ 用户可以更新自己的 profile (180ms)

[Test 8] 清理测试数据
✓ Profile 记录已删除
✓ Auth 用户已删除
✓ 测试数据已清理

============================================================
测试报告
============================================================
1. ✓ PASS - 环境变量配置
   所有必需的环境变量已配置
2. ✓ PASS - profiles 表存在性
   profiles 表可以正常访问
3. ✓ PASS - 数据一致性
   profiles 表包含 5 条记录
4. ✓ PASS - 邮箱注册 (2500ms)
   用户创建成功 (ID: xxx)
5. ✓ PASS - Profile 自动创建 (150ms)
   profiles 记录正确创建并同步
6. ✓ PASS - RLS 读取权限 (120ms)
   用户可以读取自己的 profile
7. ✓ PASS - RLS 更新权限 (180ms)
   用户可以更新自己的 profile
8. ✓ PASS - 测试数据清理
   测试数据已清理

============================================================
总计: 8 | 通过: 8 | 失败: 0
============================================================

所有测试通过! 成功率: 100.0%
```

**关键检查点**:
- ✅ 所有 8 个测试通过
- ✅ 成功率 100%
- ✅ Profile 自动创建测试通过
- ✅ RLS 权限测试通过

**如果有测试失败**: 见 [6. 故障处理](#6-故障处理)

**预计时间**: 3-4 分钟

---

#### 步骤 3.9: 手动测试 OAuth 登录（推荐）

**操作**: 使用浏览器测试 Google OAuth

1. 访问 http://localhost:3000 (或 staging URL)
2. 点击 "登录" → "使用 Google 登录"
3. 完成 Google OAuth 授权流程
4. 登录成功后，打开浏览器开发者工具
5. 在 Console 中执行:

```javascript
const { data, error } = await supabase.auth.getUser();
if (data.user) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  console.log('User Profile:', profile);
}
```

**预期输出**:
```javascript
User Profile: {
  id: "xxx",
  email: "your-email@gmail.com",
  username: "your-email",
  avatar_url: "https://lh3.googleusercontent.com/...",
  full_name: "Your Name",
  contribution_level: 0,
  badges: [],
  created_at: "2025-12-24T02:05:00.000Z",
  updated_at: "2025-12-24T02:05:00.000Z"
}
```

**检查项**:
- ✅ `avatar_url` 不为 null（Google 头像 URL）
- ✅ `full_name` 不为 null（Google 账户名）
- ✅ `username` 从邮箱生成
- ✅ `created_at` 是刚刚的时间

**预计时间**: 2 分钟

---

#### 步骤 3.10: 检查 Supabase Logs（推荐）

**操作**: 访问 Supabase Dashboard

1. 登录 https://supabase.com/dashboard
2. 选择项目 `bdndxbcmdvsgmapmgalh`
3. 导航到 **Logs** → **Postgres Logs**
4. 搜索 "handle_new_user"

**预期结果**:
- ✅ 看到触发器执行记录
- ✅ 无 ERROR 日志
- ❌ 如果看到 ERROR，记录错误信息

**预计时间**: 2 分钟

---

### 阶段 4: 清理和收尾

#### 步骤 3.11: 清理环境变量（推荐）

**操作**:
```bash
unset PGPASSWORD
unset SUPABASE_HOST
unset SUPABASE_USER
```

**验证**:
```bash
echo $PGPASSWORD
# 应无输出
```

**预计时间**: 30 秒

---

#### 步骤 3.12: 更新文档状态（可选）

**操作**: 在 `CLAUDE.md` 中标记迁移完成

**文件**: `/Users/wangfei/Documents/VibeCodinig/ChinglishWB/CLAUDE.md`

**修改**: 更新 "当前状态" 部分

```markdown
## 当前状态

MVP v0.2 (100% 完成):
- 核心页面: 首页、词条详情、榜单、投稿
- 用户认证 (支持邮箱和 Google OAuth)
- 真实 Supabase 数据库集成
- 已导入 500+ 测试词条
- ✅ Profiles 表自动同步已部署 (2025-12-24)

下一阶段: Vercel 部署和管理员审核面板
```

**预计时间**: 1 分钟

---

### 3.13 执行阶段总预计时间

- 阶段 1 (迁移 001): 2-3 分钟
- 阶段 2 (回填 002): 1-3 分钟
- 阶段 3 (验证测试): 5-7 分钟
- 阶段 4 (清理收尾): 2 分钟

**总计**: 10-15 分钟

---

## 4. 验证检查

### 4.1 数据完整性验证

#### 检查 1: auth.users 和 profiles 数量一致

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM profiles) AS profiles_count,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles)
    THEN '✓ 一致'
    ELSE '✗ 不一致'
  END AS status;
"
```

**预期输出**:
```
 auth_users_count | profiles_count |  status
------------------+----------------+---------
                5 |              5 | ✓ 一致
```

**如果不一致**: 重新执行回填脚本 002

---

#### 检查 2: 所有用户都有 profiles 记录

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
"
```

**预期输出**:
```
 id | email
----+-------
(0 rows)
```

**如果有结果**: 存在缺失的 profiles 记录，需要手动修复

---

#### 检查 3: 用户名唯一性

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT username, COUNT(*) as count
FROM profiles
GROUP BY username
HAVING COUNT(*) > 1;
"
```

**预期输出**:
```
 username | count
----------+-------
(0 rows)
```

**如果有结果**: 存在重复的用户名，需要手动修复

---

### 4.2 触发器功能验证

#### 验证 1: 触发器是否启用

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
"
```

**预期输出**:
```
       tgname        | tgenabled
---------------------+-----------
 on_auth_user_created | O         (O = enabled)
```

---

#### 验证 2: 触发器函数可执行

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'handle_new_user';
"
```

**预期输出**:
```
    proname      | prosecdef
-----------------+-----------
 handle_new_user | t          (t = SECURITY DEFINER)
```

---

### 4.3 RLS 策略验证

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';
"
```

**预期输出**:
```
 schemaname | tablename |            policyname             | cmd
------------+-----------+-----------------------------------+--------
 public     | profiles  | Profiles are viewable by everyone | SELECT
 public     | profiles  | Users can insert their own profile| INSERT
 public     | profiles  | Users can update their own profile| UPDATE
 public     | profiles  | Users cannot delete profiles      | DELETE
(4 rows)
```

---

### 4.4 索引验证

**命令**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT indexname
FROM pg_indexes
WHERE tablename = 'profiles';
"
```

**预期输出**:
```
         indexname
---------------------------
 profiles_pkey
 idx_profiles_email
 idx_profiles_username
 idx_profiles_contribution
(4 rows)
```

---

### 4.5 验证检查清单

- [ ] ✅ auth.users 和 profiles 数量一致
- [ ] ✅ 所有用户都有 profiles 记录
- [ ] ✅ 用户名唯一性通过
- [ ] ✅ 触发器启用状态正确
- [ ] ✅ 触发器函数 SECURITY DEFINER 正确
- [ ] ✅ 4 条 RLS 策略存在
- [ ] ✅ 4 个索引存在
- [ ] ✅ 自动化测试 100% 通过
- [ ] ⚠️ 手动 OAuth 测试通过（可选）
- [ ] ⚠️ Supabase Logs 无错误（可选）

---

## 5. 回滚方案

### 5.1 回滚场景

#### 场景 1: 迁移 001 执行失败

**症状**: 看到 ERROR 消息，profiles 表未创建

**回滚步骤**:
```bash
# 直接执行回滚脚本（会清理所有残留）
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -f .project-docs/database/migrations/rollback_profiles_trigger.sql
```

**验证回滚**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"
# 应返回 0 rows
```

**预计回滚时间**: < 2 分钟

---

#### 场景 2: 回填 002 执行失败

**症状**: 回填统计显示数量不一致

**回滚步骤**:

1. 不需要完全回滚，只需重新执行回填
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -f .project-docs/database/migrations/002_backfill_existing_users.sql
```

2. 如果仍然失败，完全回滚：
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -f .project-docs/database/migrations/rollback_profiles_trigger.sql
```

**预计回滚时间**: < 3 分钟

---

#### 场景 3: 触发器工作异常（新用户注册失败）

**症状**: 新用户注册时报错，或 profiles 记录未创建

**回滚步骤**:

1. **紧急修复**（禁用触发器，保留数据）:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
"
```

2. **验证触发器已禁用**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
"
# tgenabled 应为 'D' (disabled)
```

3. **手动创建缺失的 profiles 记录**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -f .project-docs/database/migrations/002_backfill_existing_users.sql
```

4. **调查问题原因**（见 6. 故障处理）

5. **修复后重新启用触发器**:
```bash
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres -c "
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
"
```

**预计回滚时间**: < 5 分钟

---

#### 场景 4: 完全回滚（恢复到迁移前状态）

**症状**: 严重错误，需要完全撤销迁移

**回滚步骤**:
```bash
# 执行完整回滚脚本
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     --single-transaction \
     -f .project-docs/database/migrations/rollback_profiles_trigger.sql
```

**预期输出**:
```
NOTICE:  ========================================
NOTICE:  警告：即将执行 profiles 表回滚操作
...
DROP TRIGGER
DROP FUNCTION
DROP POLICY
...
DROP TABLE
NOTICE:  ========================================
NOTICE:  ✓ 回滚成功完成
NOTICE:    - profiles 表已删除
NOTICE:    - 所有触发器和函数已删除
...
```

**验证回滚**:
```bash
# 检查 profiles 表是否删除
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"
# 应返回 0 rows

# 检查触发器是否删除
psql -h $SUPABASE_HOST -U $SUPABASE_USER -d postgres \
     -c "SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';"
# 应返回 0 rows
```

**预计回滚时间**: < 3 分钟

---

### 5.2 回滚后重新执行

如果回滚后需要重新执行迁移：

```bash
# 1. 确认回滚完成
psql -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"
# 应返回 0 rows

# 2. 重新执行迁移 001
psql -f .project-docs/database/migrations/001_add_profiles_trigger.sql

# 3. 重新执行回填 002
psql -f .project-docs/database/migrations/002_backfill_existing_users.sql

# 4. 重新验证
npx tsx .project-docs/testing/test_auth_flow.ts
```

---

## 6. 故障处理

### 6.1 常见错误和解决方案

#### 错误 1: "permission denied for schema auth"

**症状**:
```
ERROR: permission denied for schema auth
```

**原因**: 使用的数据库用户没有权限访问 auth schema

**解决方案**:
```bash
# 确保使用 postgres 用户（或 service_role）
psql -h $SUPABASE_HOST -U postgres -d postgres ...

# 或者在迁移脚本开头添加：
GRANT USAGE ON SCHEMA auth TO postgres;
```

---

#### 错误 2: "function handle_new_user() already exists"

**症状**:
```
ERROR: function "handle_new_user" already exists with same argument types
```

**原因**: 迁移脚本已经执行过

**解决方案**:
```bash
# 使用 CREATE OR REPLACE（脚本中已包含）
# 或者先删除旧函数：
psql -c "DROP FUNCTION IF EXISTS handle_new_user() CASCADE;"

# 然后重新执行迁移
```

---

#### 错误 3: "trigger on_auth_user_created already exists"

**症状**:
```
ERROR: trigger "on_auth_user_created" for relation "users" already exists
```

**原因**: 触发器已经创建

**解决方案**:
```bash
# 脚本中已使用 DROP TRIGGER IF EXISTS
# 如果仍然报错，手动删除：
psql -c "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;"

# 然后重新执行迁移
```

---

#### 错误 4: "duplicate key value violates unique constraint"

**症状**:
```
ERROR: duplicate key value violates unique constraint "profiles_username_key"
DETAIL: Key (username)=(test_user) already exists.
```

**原因**: 回填脚本执行时，用户名生成逻辑有问题

**解决方案**:
```bash
# 1. 检查重复的用户名
psql -c "
SELECT username, COUNT(*)
FROM profiles
GROUP BY username
HAVING COUNT(*) > 1;
"

# 2. 手动修复重复的用户名
psql -c "
UPDATE profiles
SET username = username || '_' || substr(id::text, 1, 8)
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
    FROM profiles
  ) t WHERE rn > 1
);
"
```

---

#### 错误 5: "row level security policy violation"

**症状**:
```
ERROR: new row violates row-level security policy for table "profiles"
```

**原因**: RLS 策略配置错误，触发器无法插入数据

**解决方案**:
```bash
# 检查触发器函数是否使用 SECURITY DEFINER
psql -c "
SELECT proname, prosecdef
FROM pg_proc
WHERE proname = 'handle_new_user';
"
# prosecdef 应该是 't' (true)

# 如果不是，重新创建函数：
psql -c "DROP FUNCTION IF EXISTS handle_new_user() CASCADE;"
psql -f .project-docs/database/migrations/001_add_profiles_trigger.sql
```

---

#### 错误 6: 自动化测试失败 - "profiles 表不存在"

**症状**:
```
✗ profiles 表存在性: 无法访问 profiles 表
```

**原因**: 迁移 001 未成功执行

**解决方案**:
```bash
# 1. 检查 profiles 表是否存在
psql -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"

# 2. 如果不存在，重新执行迁移 001
psql -f .project-docs/database/migrations/001_add_profiles_trigger.sql
```

---

#### 错误 7: 自动化测试失败 - "Profile 自动创建失败"

**症状**:
```
✗ Profile 自动创建: 未找到 profiles 记录
```

**原因**: 触发器未正常工作

**解决方案**:
```bash
# 1. 检查触发器是否存在且启用
psql -c "
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
"

# 2. 检查触发器函数
psql -c "SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';"

# 3. 手动测试触发器
psql -c "
DO $$
BEGIN
  -- 插入测试用户
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (gen_random_uuid(), 'manual-test@example.com', '{}'::jsonb);

  -- 检查 profiles 记录
  IF EXISTS (SELECT 1 FROM profiles WHERE email = 'manual-test@example.com') THEN
    RAISE NOTICE '✓ 触发器工作正常';
  ELSE
    RAISE EXCEPTION '✗ 触发器未创建 profiles 记录';
  END IF;

  -- 清理测试数据
  DELETE FROM auth.users WHERE email = 'manual-test@example.com';
END $$;
"
```

---

### 6.2 紧急联系人（可选）

- **数据库管理员**: [联系方式]
- **后端团队**: [联系方式]
- **Supabase 支持**: https://supabase.com/support

---

## 7. 执行后清单

### 7.1 立即验证（必须）

- [ ] ✅ auth.users 和 profiles 数量一致
- [ ] ✅ 所有用户都有 profiles 记录
- [ ] ✅ 自动化测试 100% 通过
- [ ] ✅ 手动 OAuth 登录测试通过
- [ ] ✅ Supabase Logs 无错误

### 7.2 24 小时内监控（推荐）

- [ ] ⚠️ 监控新用户注册成功率
- [ ] ⚠️ 监控触发器执行时间
- [ ] ⚠️ 监控数据库 CPU/内存使用率
- [ ] ⚠️ 检查用户反馈（如有问题报告）

### 7.3 一周内评估（推荐）

- [ ] ⚠️ 统计 OAuth 字段提取成功率
- [ ] ⚠️ 检查是否有用户名冲突
- [ ] ⚠️ 评估触发器性能影响
- [ ] ⚠️ 更新团队文档

### 7.4 文档更新（可选）

- [ ] ⚠️ 更新 CLAUDE.md "当前状态"
- [ ] ⚠️ 在 ADR-003 中标记 "已部署"
- [ ] ⚠️ 记录实际执行时间和问题（如有）

---

## 8. 执行记录模板

**执行人员**: __________
**执行日期**: 2025-12-24
**开始时间**: ____:____
**结束时间**: ____:____
**总耗时**: ____ 分钟

### 执行结果

- [ ] ✅ 成功（无错误）
- [ ] ⚠️ 部分成功（有警告但可接受）
- [ ] ❌ 失败（需要回滚）

### 遇到的问题

1. _________________________________
2. _________________________________
3. _________________________________

### 解决方案

1. _________________________________
2. _________________________________
3. _________________________________

### 最终数据统计

- auth.users 用户数: __________
- profiles 记录数: __________
- 自动化测试通过率: _________%
- 触发器平均执行时间: ____ms

### 备注

__________________________________________________
__________________________________________________
__________________________________________________

---

**计划版本**: v1.0
**最后更新**: 2025-12-24
**下次评审**: 部署后 1 周
