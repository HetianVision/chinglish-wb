# Vercel 环境变量配置清单

**项目**: Chinglish 黑白语言站
**用途**: 在 Vercel Dashboard 中配置环境变量时使用此清单

---

## 📋 如何配置

1. 访问 [Vercel Dashboard](https://vercel.com)
2. 选择您的项目 → Settings → Environment Variables
3. 逐个添加以下环境变量
4. 选择适用环境：Production / Preview / Development（建议全选）

---

## 🔑 必需的环境变量

### 1. NEXT_PUBLIC_SUPABASE_URL

**值**: 从您本地的 `.env.local` 文件复制

**格式示例**: `https://xxxxxxxxxxxxx.supabase.co`

**获取方式**:
- 打开本地项目的 `.env.local` 文件
- 或者访问 Supabase Dashboard → Settings → API → Project URL

```bash
# Vercel 中配置时：
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxxxxxxxxxx.supabase.co
Environment: Production, Preview, Development
```

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

**值**: 从您本地的 `.env.local` 文件复制

**格式示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的字符串）

**获取方式**:
- 打开本地项目的 `.env.local` 文件
- 或者访问 Supabase Dashboard → Settings → API → Project API keys → anon public

```bash
# Vercel 中配置时：
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

---

### 3. SUPABASE_SERVICE_ROLE_KEY

**值**: 从您本地的 `.env.local` 文件复制

**格式示例**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的字符串）

**获取方式**:
- 打开本地项目的 `.env.local` 文件
- 或者访问 Supabase Dashboard → Settings → API → Project API keys → service_role secret

⚠️ **警告**: 这是私密密钥，不要泄露！

```bash
# Vercel 中配置时：
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

---

### 4. ADMIN_TOKEN

**值**: 从您本地的 `.env.local` 文件复制

**格式示例**: 任意随机字符串（例如：`my-super-secret-admin-token-2024`）

**用途**: 管理员登录认证

```bash
# Vercel 中配置时：
Key: ADMIN_TOKEN
Value: 您自己设置的管理员Token
Environment: Production, Preview, Development
```

---

## 🔧 可选的环境变量

### 5. NEXT_PUBLIC_VERCEL_ANALYTICS_ID（可选）

**说明**: Vercel Analytics 会自动生成，无需手动配置

**用途**: 网站访问统计和性能监控

---

### 6. RESEND_API_KEY（未来功能，暂不配置）

**说明**: 用于邮件通知功能（未来可能需要）

**用途**: 发送邮件通知（例如：投稿审核结果）

---

## 🎯 快速配置脚本（使用 Vercel CLI）

如果您已安装 Vercel CLI，可以使用以下命令快速配置：

```bash
# 1. 登录 Vercel
vercel login

# 2. 链接到项目（在项目根目录执行）
cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
vercel link

# 3. 添加环境变量（逐个执行，每次输入对应的值）
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_TOKEN production

# 4. 如果需要同时配置 Preview 和 Development 环境
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL development
# ... 重复其他变量
```

---

## ✅ 配置完成后验证

配置完成后，在 Vercel Dashboard 中应该看到 4 个环境变量：

1. ✅ NEXT_PUBLIC_SUPABASE_URL
2. ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
3. ✅ SUPABASE_SERVICE_ROLE_KEY
4. ✅ ADMIN_TOKEN

**截图示例**:
```
Name                              Value                 Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEXT_PUBLIC_SUPABASE_URL          https://xxx...        Production, Preview, Development
NEXT_PUBLIC_SUPABASE_ANON_KEY     eyJhbGc...           Production, Preview, Development
SUPABASE_SERVICE_ROLE_KEY         eyJhbGc...           Production, Preview, Development
ADMIN_TOKEN                       my-super-s...        Production, Preview, Development
```

---

## 🔒 安全提示

1. ✅ **永远不要** 将这些值提交到 Git 仓库
2. ✅ 确认 `.env.local` 已添加到 `.gitignore`
3. ✅ 定期更换 `ADMIN_TOKEN`
4. ✅ 如果密钥泄露，立即在 Supabase Dashboard 中重新生成

---

## 🚀 下一步

环境变量配置完成后：

1. 点击 Vercel Dashboard 中的 "Deploy" 或 "Redeploy"
2. 等待构建完成（约 2-3 分钟）
3. 访问部署后的 URL 测试功能
4. 查看本地 `.env.local` 确保所有值都已正确复制

---

**准备好了吗？** 打开您的 `.env.local` 文件，开始复制这些值到 Vercel！
