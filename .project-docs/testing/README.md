# Profiles 表认证流程测试文档

## 概述

本目录包含用于验证 Chinglish WB 项目中 `profiles` 表触发器和认证流程的测试文件。

## 文件说明

### 1. `profiles_auth_test_plan.md`
**手动测试清单** - 详细的测试步骤文档

- 包含 7 个完整的测试场景
- 每个场景都有详细的操作步骤、预期结果和 SQL 验证命令
- 适用于人工测试和质量保证
- 使用 Markdown checklist 格式，方便追踪进度

**使用方法：**
```bash
# 在文本编辑器或浏览器中打开
open .project-docs/testing/profiles_auth_test_plan.md
```

### 2. `test_auth_flow.ts`
**自动化测试脚本** - TypeScript 脚本，使用 Supabase client 测试认证流程

**功能：**
- 自动检查环境配置
- 测试邮箱注册流程
- 验证 profiles 记录自动创建
- 测试 RLS 权限（读取、更新）
- 自动清理测试数据
- 生成彩色测试报告

**使用方法：**
```bash
# 方法 1: 使用 tsx 直接运行（推荐）
npx tsx .project-docs/testing/test_auth_flow.ts

# 方法 2: 使用 ts-node
npx ts-node .project-docs/testing/test_auth_flow.ts

# 方法 3: 编译后运行
npx tsc .project-docs/testing/test_auth_flow.ts --module commonjs --target es2020
node .project-docs/testing/test_auth_flow.js
```

**前置要求：**
- 安装 `tsx` 或 `ts-node`: `npm install -g tsx`
- 确保 `.env.local` 包含以下环境变量：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Supabase 项目已配置 `profiles` 表和触发器

**输出示例：**
```
╔═══════════════════════════════════════════════════════════════╗
║     Chinglish WB - Profiles 表认证流程自动化测试              ║
╚═══════════════════════════════════════════════════════════════╝

[Test 1] 检查环境配置
✓ NEXT_PUBLIC_SUPABASE_URL 已配置
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY 已配置
✓ SUPABASE_SERVICE_ROLE_KEY 已配置

...

============================================================
测试报告
============================================================
1. ✓ PASS - 环境变量配置 (10ms)
   所有必需的环境变量已配置
2. ✓ PASS - profiles 表存在性 (150ms)
   profiles 表可以正常访问
...
============================================================
总计: 8 | 通过: 8 | 失败: 0
============================================================

所有测试通过! 成功率: 100.0%
```

### 3. `../database/tests/verify_profiles_sync.sql`
**SQL 验证脚本** - 15+ 个数据库查询，验证数据一致性

**功能：**
- 检查 profiles 表结构
- 验证触发器和函数存在
- 对比 auth.users 和 profiles 数据一致性
- 检查 RLS 策略配置
- 查找缺失或孤立的记录
- 生成测试报告表

**使用方法：**
```bash
# 在 Supabase SQL Editor 中打开并执行
# Dashboard → SQL Editor → New query → 粘贴 verify_profiles_sync.sql 内容
```

或者使用 `psql` 命令行（需要配置数据库连接）：
```bash
psql -h <supabase-host> -U postgres -d postgres -f .project-docs/database/tests/verify_profiles_sync.sql
```

## 测试流程建议

### 快速验证流程（5 分钟）
1. 运行自动化测试脚本：
   ```bash
   npx tsx .project-docs/testing/test_auth_flow.ts
   ```
2. 查看测试报告，确认所有测试通过

### 完整测试流程（30 分钟）
1. 阅读 `profiles_auth_test_plan.md` 中的测试计划
2. 按照 7 个测试场景逐一手动测试：
   - 场景 1: 邮箱注册
   - 场景 2: 邮箱登录
   - 场景 3: Google OAuth 登录
   - 场景 4: 用户更新自己的 profile
   - 场景 5: 用户无法更新他人 profile
   - 场景 6: 未登录用户可以查看公开 profiles
   - 场景 7: 历史数据回填验证
3. 在 Supabase SQL Editor 中运行 `verify_profiles_sync.sql`
4. 检查测试报告表，确认所有检查项通过

### 持续集成测试流程
将自动化测试脚本集成到 CI/CD 流程中：

```yaml
# .github/workflows/test.yml
name: Auth Flow Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g tsx
      - run: npx tsx .project-docs/testing/test_auth_flow.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## 测试通过标准

### 必须全部通过的检查项
- [ ] 环境变量配置完整
- [ ] profiles 表存在且结构正确
- [ ] 触发器 `on_auth_user_created` 存在
- [ ] auth.users 与 profiles 数据一致（count 相等）
- [ ] 邮箱注册能自动创建 profiles 记录
- [ ] Google OAuth 登录能自动创建 profiles 记录
- [ ] 用户可以读取和更新自己的 profile
- [ ] RLS 策略阻止未授权操作

### 可接受的警告
- Google OAuth 用户的 full_name 可能为空（取决于 Google 账号设置）
- 邮箱用户的 avatar_url 为空（正常现象）
- profiles 创建时间与 auth.users 创建时间相差几秒（触发器延迟）

### 关键失败场景
以下情况表明存在严重问题，必须修复：
- auth.users 中存在用户但 profiles 中没有对应记录
- profiles 中有记录但 auth.users 中没有对应用户
- 用户无法读取自己的 profile
- 用户可以修改他人的 profile
- RLS 策略未启用

## 常见问题排查

### Q1: 自动化测试脚本无法运行
**错误：** `Cannot find module '@supabase/supabase-js'`

**解决方案：**
```bash
# 在项目根目录安装依赖
npm install

# 或者全局安装 tsx
npm install -g tsx
```

### Q2: 测试用户创建成功但 profiles 记录缺失
**可能原因：**
- 触发器未创建或被禁用
- 触发器函数有错误

**排查步骤：**
```sql
-- 检查触发器是否存在
SELECT * FROM information_schema.triggers WHERE event_object_table = 'users';

-- 检查触发器函数
SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'handle_new_user';
```

### Q3: RLS 权限测试失败
**错误：** `new row violates row-level security policy`

**可能原因：**
- RLS 策略配置错误
- 策略中的 auth.uid() 函数未正确识别当前用户

**解决方案：**
```sql
-- 检查 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 重新创建策略（参考 schema.sql）
```

### Q4: Google OAuth 用户信息缺失
**症状：** full_name 或 avatar_url 为空

**排查步骤：**
1. 检查 Google OAuth 配置（Supabase Dashboard → Authentication → Providers）
2. 确认 Scopes 包含 `profile` 和 `email`
3. 查看 raw_user_meta_data：
   ```sql
   SELECT raw_user_meta_data FROM auth.users WHERE email = '<google-user-email>';
   ```

## 测试数据清理

### 清理自动化测试创建的用户
自动化测试脚本会在测试结束后自动清理数据。如果清理失败，可以手动执行：

```sql
-- 查找测试用户
SELECT id, email FROM auth.users WHERE email LIKE '%@chinglishwb-test.com';

-- 删除 profiles 记录
DELETE FROM public.profiles WHERE email LIKE '%@chinglishwb-test.com';

-- 删除 auth 用户（需要使用 Supabase Dashboard 或 admin API）
```

### 清理手动测试创建的用户
在 Supabase Dashboard → Authentication → Users 中手动删除测试用户。

**注意：** 删除 auth.users 记录时，profiles 记录会通过 ON DELETE CASCADE 自动删除（如果外键配置正确）。

## 贡献指南

如果你发现测试脚本有问题或想添加新的测试场景：

1. 在 `profiles_auth_test_plan.md` 中添加新的测试场景
2. 在 `test_auth_flow.ts` 中实现对应的自动化测试函数
3. 在 `verify_profiles_sync.sql` 中添加相关的 SQL 验证查询
4. 更新本 README 文件

## 参考文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [项目数据库 Schema](../database/schema.sql)
- [CLAUDE.md 项目指南](../../CLAUDE.md)

---

**最后更新：** 2024-12-24
**维护者：** Chinglish WB 开发团队
