# 快速开始 - Profiles 表测试验证

## 立即运行测试（3 步）

### 步骤 1: 安装测试工具
```bash
# 全局安装 tsx（用于运行 TypeScript 测试脚本）
npm install -g tsx

# 或者使用 npx（无需全局安装）
# 下一步可以直接使用 npx tsx
```

### 步骤 2: 检查环境变量
确保 `.env.local` 包含以下变量：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

验证命令：
```bash
cat .env.local | grep SUPABASE
```

### 步骤 3: 运行自动化测试
```bash
# 在项目根目录运行
npx tsx .project-docs/testing/test_auth_flow.ts
```

**预期输出：**
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

## 如果自动化测试失败

### 常见错误 1: 缺少 dotenv 模块
**错误信息：** `Cannot find module 'dotenv'`

**解决方案：**
```bash
npm install dotenv
```

### 常见错误 2: 环境变量缺失
**错误信息：** `Missing Supabase credentials in .env.local`

**解决方案：**
1. 检查 `.env.local` 文件是否存在
2. 确认包含所有必需的环境变量
3. 参考 `.project-docs/ENV_VARIABLES_TEMPLATE.md`

### 常见错误 3: profiles 表不存在
**错误信息：** `relation "public.profiles" does not exist`

**解决方案：**
1. 在 Supabase SQL Editor 中创建 profiles 表
2. 参考 `.project-docs/database/schema.sql`
3. 或运行完整的 schema 创建脚本

---

## 完整测试流程（可选）

### 1. 运行 SQL 验证脚本
```bash
# 在 Supabase Dashboard 中：
# 1. 打开 SQL Editor
# 2. 复制 .project-docs/database/tests/verify_profiles_sync.sql 内容
# 3. 点击 "Run" 执行
# 4. 查看每个查询的结果
```

### 2. 手动测试认证流程
```bash
# 1. 启动开发服务器
npm run dev

# 2. 在浏览器中打开测试清单
open .project-docs/testing/profiles_auth_test_plan.md

# 3. 按照 7 个测试场景逐一测试
# - 测试邮箱注册
# - 测试 Google OAuth 登录
# - 验证 RLS 权限
```

---

## 测试通过后的下一步

### 如果所有测试通过 ✓
1. 部署到 Vercel
2. 在生产环境中再次测试 Google OAuth 登录
3. 监控 Supabase Logs（Dashboard → Logs）

### 如果部分测试失败 ✗
1. 查看测试报告中的错误信息
2. 参考 `TEST_SYSTEM_SUMMARY.md` 中的"关键问题排查"部分
3. 修复问题后重新运行测试

---

## 文件导航

- **自动化测试脚本：** `.project-docs/testing/test_auth_flow.ts`
- **SQL 验证脚本：** `.project-docs/database/tests/verify_profiles_sync.sql`
- **手动测试清单：** `.project-docs/testing/profiles_auth_test_plan.md`
- **完整文档：** `.project-docs/testing/README.md`
- **系统总结：** `.project-docs/testing/TEST_SYSTEM_SUMMARY.md`

---

## 需要帮助？

- 查看完整文档：`open .project-docs/testing/README.md`
- 查看系统总结：`open .project-docs/testing/TEST_SYSTEM_SUMMARY.md`
- 查看项目指南：`open CLAUDE.md`

**祝测试顺利！** 🐼
