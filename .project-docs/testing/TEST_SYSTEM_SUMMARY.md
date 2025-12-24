# Profiles 表测试验证系统 - 创建总结

## 已创建的文件

本次创建了完整的测试验证系统，包含 4 个核心文件：

### 1. SQL 验证脚本
**位置：** `.project-docs/database/tests/verify_profiles_sync.sql`
**大小：** 10 KB
**用途：** 数据库级别的完整性验证

**包含的检查项（共 15+ 个查询）：**
- ✓ profiles 表存在性和结构验证
- ✓ 触发器和函数存在性检查
- ✓ auth.users 与 profiles 数据一致性统计
- ✓ 查找缺失或孤立的 profiles 记录
- ✓ email 字段一致性验证
- ✓ full_name 和 avatar_url 提取验证
- ✓ RLS 策略配置检查
- ✓ 时间戳一致性验证
- ✓ 按认证提供商（email/google）统计
- ✓ 自动生成测试报告表

**使用方法：**
```bash
# 在 Supabase SQL Editor 中复制粘贴执行
# 或使用 psql 命令行
psql -h <supabase-host> -U postgres -f .project-docs/database/tests/verify_profiles_sync.sql
```

---

### 2. 手动测试清单
**位置：** `.project-docs/testing/profiles_auth_test_plan.md`
**大小：** 13 KB
**用途：** 详细的人工测试步骤文档

**包含的测试场景（共 7 个）：**
- 场景 1: 邮箱注册新用户
- 场景 2: 邮箱确认后登录
- 场景 3: Google OAuth 登录
- 场景 4: 用户更新自己的 Profile（RLS 权限）
- 场景 5: 用户无法更新他人 Profile（RLS 安全）
- 场景 6: 未登录用户可以查看公开 Profiles
- 场景 7: 验证已有用户的数据回填

**每个场景包含：**
- [ ] 详细的测试步骤（可勾选清单）
- [ ] 预期结果描述
- [ ] SQL 验证命令
- [ ] 通过/失败判断标准

**特色功能：**
- Markdown checklist 格式，方便追踪进度
- 包含问题排查指南
- 提供快速测试命令集合
- 中英文混合，技术术语精准

---

### 3. 自动化测试脚本
**位置：** `.project-docs/testing/test_auth_flow.ts`
**大小：** 16 KB
**用途：** TypeScript 端到端自动化测试

**功能模块（共 8 个测试）：**
1. 检查环境变量配置
2. 检查 profiles 表结构
3. 验证数据一致性
4. 测试邮箱注册流程
5. 验证 profiles 记录自动创建
6. 测试 RLS 读取权限
7. 测试 RLS 更新权限
8. 自动清理测试数据

**特色功能：**
- ✓ 彩色控制台输出（成功/失败/警告/信息）
- ✓ 自动生成测试报告
- ✓ 记录每个测试的执行时间
- ✓ 智能错误处理和回退
- ✓ 测试结束后自动清理数据
- ✓ 返回正确的退出状态码（CI/CD 友好）

**使用方法：**
```bash
# 方法 1: 使用 tsx（推荐）
npx tsx .project-docs/testing/test_auth_flow.ts

# 方法 2: 使用 ts-node
npx ts-node .project-docs/testing/test_auth_flow.ts
```

**前置要求：**
```bash
# 安装 tsx
npm install -g tsx

# 确保 .env.local 包含：
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

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
总计: 8 | 通过: 8 | 失败: 0
============================================================

所有测试通过! 成功率: 100.0%
```

---

### 4. 测试文档 README
**位置：** `.project-docs/testing/README.md`
**大小：** 8.3 KB
**用途：** 测试系统使用指南

**包含内容：**
- 文件说明和使用方法
- 测试流程建议（快速/完整/CI）
- 测试通过标准
- 常见问题排查（Q&A）
- 测试数据清理指南
- 贡献指南

---

## 快速开始指南

### 场景 1: 快速验证（5 分钟）
适用于开发过程中的快速检查：

```bash
# 1. 运行自动化测试
npx tsx .project-docs/testing/test_auth_flow.ts

# 2. 查看报告，确认所有测试通过
# 预期：8/8 测试通过
```

---

### 场景 2: 完整测试（30 分钟）
适用于正式部署前的全面验证：

```bash
# 1. 阅读测试计划
open .project-docs/testing/profiles_auth_test_plan.md

# 2. 按照 7 个场景手动测试
# - 测试邮箱注册/登录
# - 测试 Google OAuth 登录
# - 验证 RLS 权限控制

# 3. 在 Supabase SQL Editor 中运行 SQL 验证脚本
# 打开 .project-docs/database/tests/verify_profiles_sync.sql
# 复制粘贴到 SQL Editor 执行

# 4. 查看测试报告表
SELECT * FROM profiles_sync_report;
```

---

### 场景 3: CI/CD 集成
适用于持续集成流程：

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
      - run: npm install -g tsx
      - run: npx tsx .project-docs/testing/test_auth_flow.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

---

## 测试覆盖范围

### 数据库层面
- [x] profiles 表存在性和结构
- [x] 触发器和函数存在性
- [x] auth.users 与 profiles 数据一致性
- [x] RLS 策略配置
- [x] 时间戳一致性
- [x] 数据完整性（无缺失/孤立记录）

### 认证流程
- [x] 邮箱注册流程
- [x] 邮箱登录流程
- [x] Google OAuth 登录流程
- [x] 用户信息提取（full_name, avatar_url）
- [x] 会话管理

### 权限控制
- [x] 用户可以读取自己的 profile
- [x] 用户可以更新自己的 profile
- [x] 用户无法更新他人的 profile
- [x] 未登录用户可以查看公开 profiles
- [x] RLS 策略正确阻止未授权操作

---

## 测试通过标准

### 必须全部通过（Critical）
- [ ] SQL 验证脚本所有检查项为 PASS
- [ ] 自动化测试脚本 8/8 测试通过
- [ ] auth.users 与 profiles 记录数量一致
- [ ] 邮箱和 Google OAuth 登录都能创建 profiles
- [ ] RLS 权限控制正常工作

### 可接受的警告（Warning）
- [ ] Google 用户的 full_name 可能为空（取决于 Google 账号设置）
- [ ] 邮箱用户的 avatar_url 为空（正常现象）
- [ ] profiles 创建延迟不超过 5 秒（触发器执行时间）

---

## 关键问题排查

### 问题 1: profiles 记录未自动创建
**症状：** 用户注册后，profiles 表中没有对应记录

**排查命令：**
```sql
-- 检查触发器是否存在
SELECT * FROM information_schema.triggers WHERE event_object_table = 'users';

-- 检查缺失的 profiles
SELECT au.id, au.email FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

**解决方案：**
1. 重新创建触发器（参考 schema.sql）
2. 手动回填缺失的 profiles 记录（参考 SQL 脚本中的回填语句）

---

### 问题 2: Google OAuth 用户信息缺失
**症状：** Google 登录后，full_name 或 avatar_url 为空

**排查命令：**
```sql
-- 查看 raw_user_meta_data
SELECT
  email,
  raw_user_meta_data->>'full_name' AS metadata_name,
  raw_user_meta_data->>'avatar_url' AS metadata_avatar
FROM auth.users
WHERE email = '<google-user-email>';
```

**解决方案：**
1. 检查 Google OAuth 配置（Supabase Dashboard → Authentication → Providers）
2. 确认 Scopes 包含 `profile` 和 `email`
3. 重新登录 Google 账号测试

---

### 问题 3: RLS 权限错误
**症状：** 用户无法更新自己的 profile 或可以更新他人 profile

**排查命令：**
```sql
-- 检查 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 检查 RLS 是否启用
SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles';
```

**解决方案：**
1. 确认 RLS 已启用：`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
2. 重新创建 RLS 策略（参考 schema.sql）

---

## 文件路径总览

```
.project-docs/
├── database/
│   └── tests/
│       └── verify_profiles_sync.sql      # SQL 验证脚本
└── testing/
    ├── README.md                          # 测试文档
    ├── profiles_auth_test_plan.md         # 手动测试清单
    └── test_auth_flow.ts                  # 自动化测试脚本
```

---

## 下一步操作建议

1. **立即运行自动化测试：**
   ```bash
   npx tsx .project-docs/testing/test_auth_flow.ts
   ```

2. **如果自动化测试全部通过：**
   - 进行一次手动的 Google OAuth 登录测试
   - 在 Supabase SQL Editor 中运行 SQL 验证脚本
   - 确认所有历史用户数据已回填

3. **如果自动化测试有失败：**
   - 查看测试报告中的错误信息
   - 参考"关键问题排查"部分
   - 修复问题后重新运行测试

4. **集成到开发流程：**
   - 将自动化测试添加到 package.json scripts
   - 考虑集成到 CI/CD 流程
   - 在重要功能变更后运行完整测试

---

## 维护和更新

### 何时需要更新测试
- 修改 profiles 表结构
- 添加新的认证方式（如 Facebook、Twitter OAuth）
- 修改 RLS 策略
- 添加新的用户字段

### 如何更新测试
1. 更新 SQL 验证脚本（添加新的检查查询）
2. 更新手动测试清单（添加新的测试场景）
3. 更新自动化测试脚本（实现新的测试函数）
4. 更新 README 文档

---

**创建日期：** 2024-12-24
**版本：** v1.0
**状态：** 已完成，可立即使用
