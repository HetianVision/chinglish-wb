# Profiles 表触发器迁移 - 执行计划

**计划版本**: v1.0
**生成日期**: 2025-12-24
**预计执行时间**: 5-10 分钟
**风险等级**: 🟢 低风险

---

## 快速概览

### 执行目标

在 Supabase 数据库中创建 profiles 表和自动同步触发器，修复 Google OAuth 登录后用户无 profiles 记录的问题。

### 关键指标

| 指标 | 目标值 | 验证方法 |
|------|--------|---------|
| **迁移执行时间** | < 2 分钟 | 计时器 |
| **回填执行时间** | < 2 分钟 | SQL 输出 |
| **数据一致性** | 100% | auth.users 数量 = profiles 数量 |
| **触发器成功率** | 100% | 测试新用户注册 |
| **前端功能** | 无中断 | 登录/注册测试 |

### 执行团队

| 角色 | 职责 | 检查点 |
|------|------|--------|
| **执行者** | 运行迁移脚本 | 每步确认输出 |
| **监控者** | 观察 Supabase Dashboard | CPU/内存/日志 |
| **验证者** | 运行验证脚本 | 15 个测试项全部通过 |
| **决策者** | 判断是否回滚 | 根据失败率决策 |

---

## 第一部分：执行前准备 (预计 10 分钟)

### 步骤 1.1: 环境检查

**任务**: 验证本地环境和工具就绪

```bash
# 1. 检查 psql 客户端
psql --version
# 预期输出: psql (PostgreSQL) 14.x 或更高

# 2. 检查 Git 状态（确保无未提交更改）
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
git status
# 预期输出: nothing to commit, working tree clean

# 3. 确认迁移文件存在
ls -lh .project-docs/database/migrations/
# 预期输出:
#   001_add_profiles_trigger.sql
#   002_backfill_existing_users.sql
#   rollback_profiles_trigger.sql
#   execute-migrations.sh
```

**验证标准**: ✅ 所有命令成功执行，文件存在

**出错处理**:
- 如果 psql 不存在: `brew install postgresql`
- 如果文件缺失: 检查 Git 仓库完整性

---

### 步骤 1.2: 数据库连接验证

**任务**: 确认 Supabase 数据库可访问

```bash
# 1. 设置数据库连接字符串（从 Supabase Dashboard 获取）
export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'

# 2. 测试连接
psql $SUPABASE_DB_URL -c "SELECT version();"
# 预期输出: PostgreSQL 15.x on x86_64-pc-linux-gnu

# 3. 检查权限
psql $SUPABASE_DB_URL -c "SELECT has_schema_privilege('public', 'CREATE');"
# 预期输出: t (true)

# 4. 查看现有用户数量（用于估算回填时间）
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) as user_count FROM auth.users;"
# 预期输出:
#  user_count
# ------------
#         10
# (1 row)
```

**验证标准**: ✅ 成功连接，有 CREATE 权限，用户数 < 10,000

**出错处理**:
- **连接失败**: 检查 Supabase Dashboard → Settings → Database → Connection String
- **权限不足**: 使用 `service_role` 密钥而非 `anon` 密钥
- **用户数过多**: 如果 > 100,000，建议分批回填（见附录 A）

---

### 步骤 1.3: 备份关键数据

**任务**: 导出 auth.users 表作为安全备份

```bash
# 创建备份目录
mkdir -p .project-docs/database/backups

# 导出 auth.users 表
pg_dump $SUPABASE_DB_URL -t auth.users \
  > .project-docs/database/backups/auth_users_backup_$(date +%Y%m%d_%H%M%S).sql

# 验证备份文件
ls -lh .project-docs/database/backups/
# 预期输出: auth_users_backup_20251224_020000.sql (几十 KB)
```

**验证标准**: ✅ 备份文件生成，大小合理（> 1 KB）

**出错处理**:
- **pg_dump 不存在**: `brew install postgresql`
- **权限错误**: 检查 `$SUPABASE_DB_URL` 是否正确设置

---

### 步骤 1.4: 验证 profiles 表不存在

**任务**: 确认这是首次迁移，避免重复执行

```bash
# 检查 profiles 表是否已存在
psql $SUPABASE_DB_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';"
# 预期输出:
#  tablename
# -----------
# (0 rows)
```

**验证标准**: ✅ 返回 0 行（表不存在）

**出错处理**:
- **如果表已存在**:
  - 选项 1: 先运行回滚脚本 `bash execute-migrations.sh rollback`
  - 选项 2: 跳过迁移，直接执行验证（表可能已正确配置）

---

### 步骤 1.5: 通知团队并确认

**任务**: 发送迁移通知，获取最终确认

**通知模板**:

```
📢 数据库迁移通知

时间: [执行时间]
内容: 创建 profiles 表和自动同步触发器
预计停机: 0 分钟（无需停机）
影响范围: 新用户注册（竞态窗口 < 100ms）

执行步骤:
1. 创建 profiles 表 (1 分钟)
2. 回填现有用户 (1 分钟)
3. 验证数据一致性 (1 分钟)

回滚时间: < 2 分钟（如有必要）

请团队成员在接下来 10 分钟内避免手动修改数据库。
```

**确认清单**:
- [ ] 团队成员已收到通知
- [ ] 无其他数据库操作正在进行
- [ ] Supabase Dashboard 无服务异常告警
- [ ] 执行者已准备好监控日志

---

## 第二部分：迁移执行 (预计 5 分钟)

### 步骤 2.1: 执行迁移脚本 001 (创建 profiles 表和触发器)

**任务**: 运行第一个迁移脚本

**执行命令**:

```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/database/migrations

# 方法 1: 使用自动化脚本（推荐）
bash execute-migrations.sh migrate

# 方法 2: 手动执行单个脚本
psql $SUPABASE_DB_URL -f 001_add_profiles_trigger.sql
```

**预期输出**:

```
========================================
Chinglish WB - 数据库迁移工具
========================================

[INFO] 开始执行迁移...
[WARNING] 即将执行 profiles 表迁移，这将创建新表和触发器。
是否继续? (y/N) y

[INFO] 执行: 创建 profiles 表和触发器
[INFO] 文件: 001_add_profiles_trigger.sql

  NOTICE: profiles 表已创建
  NOTICE: 索引已创建
  NOTICE: RLS 已启用
  NOTICE: RLS 策略已创建
  NOTICE: 触发器 update_profiles_updated_at 已创建
  NOTICE: 函数 handle_new_user() 已创建
  NOTICE: 触发器 on_auth_user_created 已创建

[SUCCESS] 创建 profiles 表和触发器 执行成功
```

**实时监控** (在 Supabase Dashboard):

1. 打开 **Database → Logs**
2. 筛选 `severity = INFO OR severity = NOTICE`
3. 查看是否有 ERROR 日志

**验证标准**:
- ✅ 无 ERROR 输出
- ✅ 所有 NOTICE 消息出现
- ✅ 脚本返回码 = 0 (`echo $?`)

**出错处理**:

| 错误类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `ERROR: permission denied` | 权限不足 | 使用 `service_role` 连接字符串 |
| `ERROR: relation "profiles" already exists` | 表已存在 | 执行回滚后重试 |
| `ERROR: function "update_updated_at_column" does not exist` | schema.sql 未完整执行 | 先运行完整 schema.sql |
| `ERROR: cross-database references are not implemented` | 连接到错误的数据库 | 检查 `SUPABASE_DB_URL` |

**如果出错，执行紧急回滚**:

```bash
# 立即回滚
bash execute-migrations.sh rollback

# 验证回滚
psql $SUPABASE_DB_URL -c "SELECT tablename FROM pg_tables WHERE tablename = 'profiles';"
# 预期: 0 rows
```

---

### 步骤 2.2: 执行回填脚本 002 (同步现有用户)

**任务**: 为所有现有 auth.users 创建 profiles 记录

**执行命令**:

```bash
# 如果使用自动化脚本，此步骤已自动执行
# 手动执行方式:
psql $SUPABASE_DB_URL -f 002_backfill_existing_users.sql
```

**预期输出**:

```
NOTICE: ========================================
NOTICE: 回填统计：
NOTICE:   auth.users 总用户数: 10
NOTICE:   profiles 当前记录数: 10
NOTICE:   本次回填创建记录数: 10
NOTICE: ========================================
NOTICE: ✓ 同步完成：所有 auth.users 都有对应的 profiles 记录
NOTICE: ✓ 数据完整性检查通过：所有用户都有对应的 profiles 记录
NOTICE: ✓ 用户名唯一性检查通过
```

**性能监控** (在 Supabase Dashboard):

1. 打开 **Database → Performance**
2. 监控指标:
   - CPU 使用率: 应 < 50%
   - 内存使用: 应 < 70%
   - 活跃连接数: 应 < 10

**验证标准**:
- ✅ `auth.users 总用户数` = `profiles 当前记录数`
- ✅ 无 WARNING 或 ERROR
- ✅ 执行时间 < 2 分钟（10,000 用户以下）

**出错处理**:

| 错误类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `ERROR: duplicate key value violates unique constraint "profiles_pkey"` | profiles 表已有部分数据 | 正常，脚本会跳过已存在的记录 |
| `ERROR: duplicate key value violates unique constraint "profiles_username_key"` | 用户名冲突 | 检查 CASE 语句逻辑，应自动添加随机后缀 |
| `NOTICE: ⚠ 同步不完整` | 回填过程中有新用户注册 | 重新运行回填脚本（幂等） |
| 执行超时 (> 2 分钟) | 用户数过多 (> 100,000) | 使用分批回填方案（见附录 A） |

**如果出错且无法自动恢复**:

```bash
# 检查当前状态
psql $SUPABASE_DB_URL -c "
  SELECT
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles;
"

# 如果数据不一致，重新运行回填
psql $SUPABASE_DB_URL -f 002_backfill_existing_users.sql
```

---

### 步骤 2.3: 实时监控 (迁移执行期间)

**任务**: 在脚本执行时监控数据库状态

**监控面板**:

#### 监控点 1: Supabase Dashboard

1. 打开 **Database → Postgres Logs**
2. 设置筛选:
   - Time Range: Last 5 minutes
   - Severity: All
3. 监控关键日志:
   - ✅ `CREATE TABLE public.profiles`
   - ✅ `CREATE TRIGGER on_auth_user_created`
   - ❌ 任何 `ERROR` 日志

#### 监控点 2: 数据库性能

```bash
# 在另一个终端实时监控
watch -n 2 "psql $SUPABASE_DB_URL -c \"
  SELECT
    (SELECT COUNT(*) FROM auth.users) as auth_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections;
\""
```

**预期输出**:

```
 auth_users | profiles | active_connections
------------+----------+-------------------
         10 |       10 |                 2
```

#### 监控点 3: 触发器执行日志

```bash
# 查看触发器相关日志
psql $SUPABASE_DB_URL -c "
  SELECT
    event_object_table,
    trigger_name,
    action_statement
  FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
"
```

**预期输出**:

```
 event_object_table |    trigger_name      |        action_statement
--------------------+----------------------+--------------------------------
 users              | on_auth_user_created | EXECUTE FUNCTION handle_new_user()
```

---

## 第三部分：迁移验证 (预计 3 分钟)

### 步骤 3.1: 运行自动化验证脚本

**任务**: 执行完整的验证测试套件

**执行命令**:

```bash
# 方法 1: 使用执行脚本的 verify 命令
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/database/migrations
bash execute-migrations.sh verify

# 方法 2: 手动运行完整验证脚本
psql $SUPABASE_DB_URL -f ../tests/verify_profiles_sync.sql
```

**预期输出** (精简版):

```
profiles 表状态: ✓ 已创建
on_auth_user_created 触发器: ✓ 已创建

      info       | auth_users | profiles | sync_status
-----------------+------------+----------+-------------
 用户数据统计:   |         10 |       10 | ✓ 同步完整

# 测试报告
  test_name      | status | details
-----------------+--------+--------------------------------
 Table Exists    | PASS   | profiles table found
 Trigger Exists  | PASS   | on_auth_user_created trigger found
 Data Consistency| PASS   | auth.users: 10, profiles: 10
 Missing Profiles| PASS   | Found 0 users without profiles
 RLS Enabled     | PASS   | Row Level Security is enabled
```

**验证标准**:
- ✅ 所有测试项 `status = PASS`
- ✅ `sync_status = ✓ 同步完整`
- ✅ `Missing Profiles = 0`

**如果有 FAIL 项**:

| 失败项 | 可能原因 | 修复方案 |
|-------|---------|---------|
| Table Exists | 001 脚本未执行 | 重新执行 001 |
| Trigger Exists | 触发器创建失败 | 检查权限，重新执行 001 |
| Data Consistency | 回填脚本未执行或执行失败 | 重新执行 002 |
| Missing Profiles | 回填期间有新用户注册 | 重新执行 002（幂等） |
| RLS Enabled | RLS 未启用 | 手动启用: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;` |

---

### 步骤 3.2: 手动验证关键功能

**任务**: 逐项检查核心功能点

#### 验证项 1: profiles 表结构

```bash
psql $SUPABASE_DB_URL -c "
  SELECT
    column_name,
    data_type,
    is_nullable
  FROM information_schema.columns
  WHERE table_name = 'profiles'
  ORDER BY ordinal_position;
"
```

**预期输出**:

```
   column_name      |       data_type        | is_nullable
--------------------+------------------------+-------------
 id                 | uuid                   | NO
 email              | text                   | YES
 username           | text                   | YES
 avatar_url         | text                   | YES
 full_name          | text                   | YES
 contribution_level | integer                | YES
 badges             | ARRAY                  | YES
 created_at         | timestamp with time zone | YES
 updated_at         | timestamp with time zone | YES
```

#### 验证项 2: 触发器函数存在

```bash
psql $SUPABASE_DB_URL -c "
  SELECT
    proname AS function_name,
    prosecdef AS security_definer,
    prokind AS kind
  FROM pg_proc
  WHERE proname = 'handle_new_user'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
"
```

**预期输出**:

```
 function_name   | security_definer | kind
-----------------+------------------+------
 handle_new_user | t                | f
```

(`security_definer = t` 表示使用 SECURITY DEFINER)

#### 验证项 3: RLS 策略

```bash
psql $SUPABASE_DB_URL -c "
  SELECT
    policyname,
    cmd,
    permissive
  FROM pg_policies
  WHERE tablename = 'profiles'
  ORDER BY policyname;
"
```

**预期输出**:

```
            policyname             |  cmd   | permissive
-----------------------------------+--------+------------
 Profiles are viewable by everyone | SELECT | PERMISSIVE
 Users can insert their own profile| INSERT | PERMISSIVE
 Users can update their own profile| UPDATE | PERMISSIVE
 Users cannot delete profiles      | DELETE | PERMISSIVE
```

#### 验证项 4: 数据完整性

```bash
psql $SUPABASE_DB_URL -c "
  SELECT
    au.id,
    au.email,
    p.username,
    p.full_name,
    p.created_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  ORDER BY au.created_at DESC
  LIMIT 5;
"
```

**预期输出**: 每个 auth.users 都有对应的 profiles 记录

```
                  id                  |        email        | username | full_name |         created_at
--------------------------------------+---------------------+----------+-----------+----------------------------
 123e4567-e89b-12d3-a456-426614174000 | alice@example.com   | alice    | Alice Wang| 2025-12-24 10:00:00+00
 ...
```

**如果发现缺失记录**:

```bash
# 查找缺失的用户
psql $SUPABASE_DB_URL -c "
  SELECT au.id, au.email
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
"

# 如果有缺失，重新运行回填
psql $SUPABASE_DB_URL -f 002_backfill_existing_users.sql
```

---

### 步骤 3.3: 测试触发器功能 (创建测试用户)

**任务**: 注册新用户验证触发器自动创建 profiles

**方法 1: 使用前端界面**

1. 打开应用: `http://localhost:3000` (或生产 URL)
2. 点击"注册"
3. 使用邮箱注册: `test-trigger-$(date +%s)@example.com`
4. 密码: `Test@12345`
5. 提交注册

**方法 2: 使用 Supabase CLI (推荐)**

```bash
# 创建测试用户
TEST_EMAIL="test-trigger-$(date +%s)@example.com"

psql $SUPABASE_DB_URL -c "
  -- 注意: 通常应通过 Supabase Auth API 创建用户
  -- 此处仅为测试，生产环境勿用
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    '$TEST_EMAIL',
    crypt('test123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{\"provider\":\"email\"}',
    false
  ) RETURNING id;
"
```

**验证触发器执行**:

```bash
# 检查新用户是否有 profiles 记录
psql $SUPABASE_DB_URL -c "
  SELECT
    au.email,
    p.username,
    p.created_at
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.id
  WHERE au.email = '$TEST_EMAIL';
"
```

**预期输出**:

```
           email            |    username     |         created_at
----------------------------+-----------------+----------------------------
 test-trigger-1234567@...   | test-trigger-1234567 | 2025-12-24 10:05:00+00
```

**如果无 profiles 记录**:

```bash
# 检查触发器是否存在
psql $SUPABASE_DB_URL -c "
  SELECT * FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
"

# 检查触发器函数日志（Supabase Dashboard → Logs）
# 搜索: "handle_new_user"
```

---

### 步骤 3.4: 测试 Google OAuth 流程 (可选)

**任务**: 验证 OAuth 用户的头像和姓名正确提取

**执行步骤**:

1. 打开应用登录页
2. 点击"使用 Google 登录"
3. 完成 OAuth 授权
4. 登录成功后，检查数据库:

```bash
# 获取最新的 Google OAuth 用户
psql $SUPABASE_DB_URL -c "
  SELECT
    au.email,
    au.raw_user_meta_data->>'provider' AS provider,
    au.raw_user_meta_data->>'picture' AS google_avatar,
    au.raw_user_meta_data->>'full_name' AS google_name,
    p.avatar_url AS profile_avatar,
    p.full_name AS profile_name
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.id
  WHERE au.raw_user_meta_data->>'provider' = 'google'
  ORDER BY au.created_at DESC
  LIMIT 1;
"
```

**预期输出**:

```
      email       | provider |        google_avatar        |  google_name  | profile_avatar | profile_name
------------------+----------+-----------------------------+---------------+----------------+--------------
 user@gmail.com   | google   | https://lh3.googleusercontent.com/... | Alice Wang | https://lh3... | Alice Wang
```

**验证标准**:
- ✅ `google_avatar` = `profile_avatar`
- ✅ `google_name` = `profile_name`

---

### 步骤 3.5: 前端功能测试

**任务**: 确认前端所有功能正常

#### 测试项 1: 用户登录

- [ ] 邮箱/密码登录 → 成功 → Header 显示用户头像
- [ ] Google OAuth 登录 → 成功 → Header 显示 Google 头像
- [ ] 未登录用户 → Header 显示"登录"按钮

#### 测试项 2: 用户菜单

- [ ] 点击头像 → 下拉菜单展开
- [ ] 显示用户名称（从 `user.user_metadata.full_name` 或邮箱前缀）
- [ ] 显示用户邮箱
- [ ] "我的资料"、"我的投稿"、"设置"、"退出登录" 菜单项存在

#### 测试项 3: 词条投稿

- [ ] 登录用户可以访问 `/submit` 页面
- [ ] 提交词条 → 成功 → `submissions` 表新增记录
- [ ] `submitter_name` 字段填充正确

#### 测试项 4: 退出登录

- [ ] 点击"退出登录" → 前端清除 session
- [ ] Header 切换回"登录"按钮
- [ ] 再次登录 → 用户数据正确显示

**验证标准**: ✅ 所有测试项通过

---

## 第四部分：迁移后操作 (预计 2 分钟)

### 步骤 4.1: 清理测试数据

**任务**: 删除测试过程中创建的用户

```bash
# 列出所有测试用户
psql $SUPABASE_DB_URL -c "
  SELECT id, email
  FROM auth.users
  WHERE email LIKE 'test-trigger-%@example.com';
"

# 删除测试用户（会自动级联删除 profiles）
psql $SUPABASE_DB_URL -c "
  DELETE FROM auth.users
  WHERE email LIKE 'test-trigger-%@example.com';
"

# 验证删除
psql $SUPABASE_DB_URL -c "
  SELECT COUNT(*) FROM auth.users WHERE email LIKE 'test-%';
"
# 预期输出: 0
```

---

### 步骤 4.2: 生成执行报告

**任务**: 记录迁移结果

**创建报告文件**:

```bash
cat > /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/MIGRATION_REPORT_$(date +%Y%m%d).md << 'EOF'
# Profiles 表触发器迁移 - 执行报告

**执行日期**: $(date)
**执行人**: [您的姓名]
**执行环境**: Supabase Project [项目 ID]

## 执行结果

### 迁移统计

- ✅ profiles 表创建成功
- ✅ 触发器 on_auth_user_created 创建成功
- ✅ RLS 策略配置成功
- ✅ 回填现有用户: [用户数] 个
- ✅ 数据一致性: 100%

### 执行时间

| 步骤 | 开始时间 | 结束时间 | 耗时 |
|------|---------|---------|------|
| 001 迁移脚本 | [时间] | [时间] | [X 秒] |
| 002 回填脚本 | [时间] | [时间] | [X 秒] |
| 验证测试 | [时间] | [时间] | [X 秒] |
| **总计** | [时间] | [时间] | **[X 分钟]** |

### 验证结果

```
[粘贴 verify_profiles_sync.sql 的输出]
```

### 发现的问题

- [列出任何异常情况]
- [或写: 无]

### 后续行动

- [ ] 监控首 24 小时的触发器执行日志
- [ ] 补充 UserProfile TypeScript 类型定义
- [ ] 实现 getUserProfile() 查询函数
- [ ] 更新用户手册（如有）

## 签名

执行者: ________________  日期: ____________
审核者: ________________  日期: ____________
EOF
```

---

### 步骤 4.3: 设置监控告警 (可选)

**任务**: 在 Supabase Dashboard 配置告警

**推荐告警规则**:

1. **触发器执行失败告警**:
   - 条件: Postgres Logs 中出现 `ERROR` 且包含 `handle_new_user`
   - 通知方式: 邮件/Slack

2. **数据不一致告警**:
   - SQL 查询:
     ```sql
     SELECT COUNT(*) FROM auth.users
     WHERE id NOT IN (SELECT id FROM public.profiles);
     ```
   - 条件: 结果 > 0
   - 频率: 每小时检查

3. **性能告警**:
   - 条件: 数据库 CPU > 80% 持续 5 分钟
   - 通知方式: 邮件

**配置步骤** (Supabase Dashboard):
1. Settings → Integrations → Webhooks
2. 添加 Webhook URL（连接到告警系统）
3. 配置触发条件

---

### 步骤 4.4: 更新项目文档

**任务**: 标记迁移为"已完成"

```bash
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB

# 更新 CLAUDE.md 状态
sed -i '' 's/MVP v0.2 (95% 完成)/MVP v0.2 (100% 完成 - Profiles 迁移已完成)/' CLAUDE.md

# 更新 ADR-003 状态
echo "
---

## 执行记录

- **执行日期**: $(date +%Y-%m-%d)
- **执行结果**: ✅ 成功
- **数据同步**: 100% ($(psql $SUPABASE_DB_URL -t -c 'SELECT COUNT(*) FROM profiles') 用户)
- **执行时间**: [填写总耗时]
- **验证状态**: 所有测试通过
" >> .project-docs/decisions/ADR-003-profiles-auto-sync.md

# Git 提交
git add .
git commit -m "docs: mark profiles trigger migration as completed"
```

---

### 步骤 4.5: 通知团队完成

**任务**: 发送迁移完成通知

**通知模板**:

```
✅ 数据库迁移完成

内容: Profiles 表触发器迁移
结果: 成功
数据一致性: 100%
执行时间: [X 分钟]

关键变更:
- ✅ 创建 public.profiles 表
- ✅ 配置自动同步触发器 on_auth_user_created
- ✅ 回填现有用户: [X] 个
- ✅ 所有验证测试通过

影响范围:
- 新用户注册: 自动创建 profiles 记录
- 现有用户: 数据已同步
- 前端功能: 无需修改，兼容

下一步:
- 监控首 24 小时的触发器日志
- 如有异常请立即联系 [负责人]

完整报告: .project-docs/MIGRATION_REPORT_[日期].md
```

---

## 第五部分：持续监控 (首 24 小时)

### 步骤 5.1: 第 1 小时监控

**任务**: 密切观察迁移后的系统状态

**监控清单**:

- [ ] **每 10 分钟**: 检查 Supabase Dashboard → Logs
  - 搜索: `handle_new_user`
  - 预期: 每次新用户注册出现 1 次成功日志
  - ❌ 如果出现 ERROR: 立即调查

- [ ] **每 30 分钟**: 运行数据一致性检查
  ```bash
  psql $SUPABASE_DB_URL -c "
    SELECT
      (SELECT COUNT(*) FROM auth.users) as auth_users,
      (SELECT COUNT(*) FROM profiles) as profiles,
      (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) as diff;
  "
  ```
  - 预期: `diff = 0`
  - ❌ 如果 `diff > 0`: 重新运行回填脚本

- [ ] **持续**: 观察前端用户报告
  - 监控渠道: 用户反馈、错误日志、Sentry
  - 关注: "无法注册"、"无法登录" 错误

---

### 步骤 5.2: 第 1-24 小时监控

**任务**: 定期检查系统健康

**监控频率**: 每 6 小时

**监控项目**:

1. **触发器执行统计**:
   ```bash
   psql $SUPABASE_DB_URL -c "
     SELECT
       COUNT(*) as new_users_today
     FROM auth.users
     WHERE created_at > NOW() - INTERVAL '24 hours';
   "

   psql $SUPABASE_DB_URL -c "
     SELECT
       COUNT(*) as new_profiles_today
     FROM profiles
     WHERE created_at > NOW() - INTERVAL '24 hours';
   "
   ```
   - 预期: 两个数字相等

2. **性能指标** (Supabase Dashboard → Performance):
   - CPU 平均值: < 30%
   - 内存使用: < 60%
   - 磁盘 I/O: 无明显增长
   - 平均查询时间: 无明显变化

3. **用户反馈**:
   - 检查支持渠道（邮件、工单、论坛）
   - 关键词: "注册"、"登录"、"头像"、"用户名"

---

### 步骤 5.3: 异常响应流程

**触发条件**: 发现以下任一情况

| 异常 | 严重程度 | 响应时间 | 处理方案 |
|------|---------|---------|---------|
| 触发器执行失败率 > 5% | 🔴 高 | 立即 | 执行回滚 |
| 数据不一致 (diff > 10) | 🟡 中 | 1 小时内 | 重新运行回填 |
| 数据库 CPU > 80% | 🟡 中 | 1 小时内 | 检查慢查询 |
| 用户投诉 > 3 件 | 🟡 中 | 2 小时内 | 调查根因 |
| 前端功能中断 | 🔴 高 | 立即 | 执行回滚 |

**响应步骤**:

1. **收集信息**:
   - 截图 Supabase Dashboard 错误日志
   - 导出最近 1 小时的 Postgres Logs
   - 运行 `verify_profiles_sync.sql` 保存输出

2. **判断是否回滚**:
   - 如果满足回滚条件 → 执行 `bash execute-migrations.sh rollback`
   - 如果是局部问题 → 继续调查

3. **通知相关人员**:
   - 技术负责人
   - 产品经理（如果影响用户）

---

## 第六部分：故障排查指南

### 常见问题 1: 触发器未执行

**症状**: 新用户注册后，profiles 表无对应记录

**诊断步骤**:

```bash
# 1. 检查触发器是否存在
psql $SUPABASE_DB_URL -c "
  SELECT * FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
"
# 预期: 1 行

# 2. 检查触发器是否启用
psql $SUPABASE_DB_URL -c "
  SELECT
    tgname AS trigger_name,
    tgenabled AS enabled  -- 'O' = enabled
  FROM pg_trigger
  WHERE tgname = 'on_auth_user_created';
"
# 预期: enabled = 'O'

# 3. 手动测试触发器函数
psql $SUPABASE_DB_URL -c "
  SELECT handle_new_user() FROM auth.users LIMIT 1;
"
# 预期: 返回结果（或错误信息）
```

**解决方案**:

- 如果触发器不存在: 重新运行 `001_add_profiles_trigger.sql`
- 如果触发器已禁用:
  ```sql
  ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
  ```
- 如果函数报错: 查看错误信息，修复后重新创建函数

---

### 常见问题 2: 用户名冲突导致注册失败

**症状**: 用户注册时报错 "duplicate key value violates unique constraint"

**诊断步骤**:

```bash
# 查看是否有重复用户名
psql $SUPABASE_DB_URL -c "
  SELECT username, COUNT(*)
  FROM profiles
  GROUP BY username
  HAVING COUNT(*) > 1;
"
```

**解决方案**:

1. **紧急修复**: 手动修改重复用户名
   ```sql
   UPDATE profiles
   SET username = username || '_' || substr(md5(id::text), 1, 6)
   WHERE id IN (
     SELECT id FROM (
       SELECT id, ROW_NUMBER() OVER (PARTITION BY username ORDER BY created_at) as rn
       FROM profiles
     ) t WHERE rn > 1
   );
   ```

2. **长期修复**: 增强触发器函数的冲突检测逻辑
   - 在 `handle_new_user()` 中增加最大重试次数
   - 使用事务隔离级别 `SERIALIZABLE`

---

### 常见问题 3: OAuth 头像未提取

**症状**: Google 登录后，profiles.avatar_url 为 NULL

**诊断步骤**:

```bash
# 查看 raw_user_meta_data 的实际结构
psql $SUPABASE_DB_URL -c "
  SELECT
    email,
    raw_user_meta_data
  FROM auth.users
  WHERE raw_user_meta_data->>'provider' = 'google'
  ORDER BY created_at DESC
  LIMIT 1;
"
```

**可能的字段名**:
- `picture` (Google)
- `avatar_url` (GitHub)
- `profile_image_url` (Twitter)
- `picture.data.url` (Facebook 嵌套)

**解决方案**:

修改触发器函数 `handle_new_user()` 中的 COALESCE 逻辑：

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
...
avatar_url: COALESCE(
  NEW.raw_user_meta_data->>'avatar_url',
  NEW.raw_user_meta_data->>'picture',
  NEW.raw_user_meta_data->>'profile_image_url',  -- 新增
  NEW.raw_user_meta_data->'picture'->'data'->>'url',  -- Facebook
  NULL
)
...
```

---

### 常见问题 4: 数据库连接池耗尽

**症状**: "sorry, too many clients already" 错误

**诊断步骤**:

```bash
# 查看当前活跃连接数
psql $SUPABASE_DB_URL -c "
  SELECT
    COUNT(*) as total_connections,
    COUNT(*) FILTER (WHERE state = 'active') as active_connections,
    COUNT(*) FILTER (WHERE state = 'idle') as idle_connections
  FROM pg_stat_activity;
"
```

**解决方案**:

1. **临时修复**: 终止空闲连接
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
     AND state_change < NOW() - INTERVAL '5 minutes';
   ```

2. **长期修复**: 升级 Supabase 计划或优化连接池配置

---

## 第七部分：回滚决策矩阵

### 何时回滚

**自动回滚触发条件** (无需人工判断):

| 条件 | 阈值 | 检测方式 | 行动 |
|------|------|---------|------|
| 迁移脚本执行失败 | 任何 ERROR | 脚本返回码 ≠ 0 | 立即自动回滚 |
| 验证脚本 FAIL 项 > 2 | > 2 | verify_profiles_sync.sql | 立即手动回滚 |

**手动回滚决策表**:

| 指标 | 绿色区域 (继续) | 黄色区域 (观察) | 红色区域 (回滚) |
|------|---------------|---------------|---------------|
| 触发器执行成功率 | > 98% | 95-98% | < 95% |
| 数据一致性 (diff) | 0 | 1-10 | > 10 |
| 用户注册失败率 | < 1% | 1-5% | > 5% |
| 数据库 CPU 平均值 | < 50% | 50-80% | > 80% |
| 用户投诉数 (1 小时内) | 0 | 1-2 | > 3 |

**回滚决策流程图**:

```
发现异常
    ↓
是否满足自动回滚条件？
    ↓ 是              ↓ 否
立即执行回滚    →  查看手动决策表
    ↓                    ↓
验证回滚成功      是否在红色区域？
    ↓                    ↓ 是        ↓ 否
通知团队          执行回滚      持续监控
    ↓                    ↓              ↓
记录 Post-Mortem    验证回滚      定期重新评估
```

---

## 第八部分：成功标准总结

### 迁移成功的定义

满足以下**所有**条件，迁移视为成功：

- [x] ✅ 001 和 002 迁移脚本执行无 ERROR
- [x] ✅ verify_profiles_sync.sql 所有测试项 PASS
- [x] ✅ auth.users 和 profiles 数据 100% 同步 (diff = 0)
- [x] ✅ 触发器在测试用户注册时自动执行
- [x] ✅ OAuth 用户的头像和姓名正确提取到 profiles
- [x] ✅ 前端登录/注册功能无异常
- [x] ✅ 首 24 小时无用户投诉
- [x] ✅ 数据库性能指标无明显下降

### 质量保证检查点

| 检查点 | 验证方法 | 期望结果 | 实际结果 | 通过/失败 |
|--------|---------|---------|---------|----------|
| 表结构正确 | `\d profiles` | 9 个字段 | [填写] | ☐ |
| 触发器存在 | information_schema.triggers | 1 个触发器 | [填写] | ☐ |
| RLS 启用 | pg_tables.rowsecurity | true | [填写] | ☐ |
| 数据完整 | COUNT(*) 对比 | 0 差异 | [填写] | ☐ |
| 性能正常 | Dashboard → Performance | CPU < 50% | [填写] | ☐ |
| 前端功能 | 手动测试 | 所有测试通过 | [填写] | ☐ |

---

## 第九部分：附录

### 附录 A: 大量用户回填方案 (> 100,000)

**场景**: 当 auth.users 数量超过 100,000 时，单次回填可能超时

**分批回填脚本**:

```sql
-- backfill_in_batches.sql
DO $$
DECLARE
  batch_size INTEGER := 10000;
  offset_value INTEGER := 0;
  inserted_count INTEGER;
  total_inserted INTEGER := 0;
BEGIN
  LOOP
    -- 每批回填 10,000 用户
    INSERT INTO public.profiles (id, email, username, avatar_url, full_name, contribution_level, created_at, updated_at)
    SELECT
      au.id,
      au.email,
      CASE
        WHEN EXISTS (SELECT 1 FROM public.profiles WHERE username = split_part(au.email, '@', 1))
        THEN split_part(au.email, '@', 1) || '_' || substr(md5(au.id::text), 1, 6)
        ELSE split_part(au.email, '@', 1)
      END AS username,
      COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture', NULL),
      COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', NULL),
      0,
      au.created_at,
      NOW()
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
    ORDER BY au.created_at
    LIMIT batch_size;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    total_inserted := total_inserted + inserted_count;

    RAISE NOTICE '已回填 % 个用户 (本批: %)', total_inserted, inserted_count;

    -- 如果本批插入数为 0，说明已完成
    EXIT WHEN inserted_count = 0;

    -- 短暂延迟，避免数据库压力过大
    PERFORM pg_sleep(1);
  END LOOP;

  RAISE NOTICE '回填完成，总共创建 % 个 profiles 记录', total_inserted;
END $$;
```

**使用方法**:

```bash
psql $SUPABASE_DB_URL -f backfill_in_batches.sql
```

---

### 附录 B: 快速参考命令

**数据库连接**:
```bash
export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'
psql $SUPABASE_DB_URL
```

**执行迁移**:
```bash
cd .project-docs/database/migrations
bash execute-migrations.sh migrate
```

**验证迁移**:
```bash
bash execute-migrations.sh verify
```

**回滚迁移**:
```bash
bash execute-migrations.sh rollback
```

**查看 profiles 数量**:
```bash
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM profiles;"
```

**查看触发器状态**:
```bash
psql $SUPABASE_DB_URL -c "SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';"
```

**检查数据一致性**:
```bash
psql $SUPABASE_DB_URL -c "SELECT (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM profiles) AS diff;"
```

---

### 附录 C: 联系信息和资源

**项目资源**:
- 项目路径: `/Users/wangfei/Documents/VibeCodinig/ChinglishWB`
- 迁移脚本: `.project-docs/database/migrations/`
- 验证脚本: `.project-docs/database/tests/verify_profiles_sync.sql`
- 风险评估: `.project-docs/RISK_ASSESSMENT.md`
- ADR 文档: `.project-docs/decisions/ADR-003-profiles-auto-sync.md`

**Supabase 资源**:
- Dashboard: https://app.supabase.com
- 文档: https://supabase.com/docs
- 支持: https://supabase.com/support

**PostgreSQL 资源**:
- 触发器文档: https://www.postgresql.org/docs/current/sql-createtrigger.html
- RLS 文档: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

## 执行清单总览

### 执行前 (10 分钟)

- [ ] 检查 psql 客户端
- [ ] 验证数据库连接
- [ ] 备份 auth.users 表
- [ ] 确认 profiles 表不存在
- [ ] 通知团队

### 执行中 (5 分钟)

- [ ] 运行 001_add_profiles_trigger.sql
- [ ] 运行 002_backfill_existing_users.sql
- [ ] 监控 Supabase Dashboard

### 验证 (3 分钟)

- [ ] 运行 verify_profiles_sync.sql (所有 PASS)
- [ ] 手动验证表结构
- [ ] 测试触发器 (创建测试用户)
- [ ] 测试 Google OAuth (可选)
- [ ] 前端功能测试

### 执行后 (2 分钟)

- [ ] 清理测试数据
- [ ] 生成执行报告
- [ ] 更新项目文档
- [ ] 通知团队完成

### 持续监控 (24 小时)

- [ ] 第 1 小时: 每 10 分钟检查日志
- [ ] 第 1-24 小时: 每 6 小时检查一致性
- [ ] 监控用户反馈
- [ ] 如有异常: 执行回滚决策流程

---

**文档版本**: v1.0
**最后更新**: 2025-12-24
**维护者**: Development Team
**下次评审**: 迁移执行后 1 周
