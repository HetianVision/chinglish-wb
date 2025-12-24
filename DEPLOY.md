# 🚀 Vercel 部署 - 快速开始

**项目**: Chinglish 黑白语言站
**状态**: ✅ 已准备好部署
**构建测试**: ✅ 通过

---

## 🎯 立即部署（3种方式任选其一）

### 方式 1: 一键部署脚本（最简单）⭐

```bash
# 在项目根目录运行
bash deploy.sh
```

这个脚本会自动：
- 检查环境配置
- 安装依赖
- 运行代码检查
- 测试构建
- 提示部署步骤

---

### 方式 2: GitHub + Vercel（推荐用于团队）

**步骤 1**: 推送代码到 GitHub
```bash
git add .
git commit -m "ready for production deployment"
git push origin main
```

**步骤 2**: 在 Vercel 中导入项目
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择您的 GitHub 仓库
4. Vercel 自动检测 Next.js

**步骤 3**: 配置环境变量（重要！）
在 Vercel Dashboard → Settings → Environment Variables 中添加：

| 变量名 | 从哪里获取 |
|--------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | 本地 `.env.local` 文件 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本地 `.env.local` 文件 |
| `SUPABASE_SERVICE_ROLE_KEY` | 本地 `.env.local` 文件 |
| `ADMIN_TOKEN` | 本地 `.env.local` 文件 |

**详细说明**: 查看 [.project-docs/ENV_VARIABLES_TEMPLATE.md](.project-docs/ENV_VARIABLES_TEMPLATE.md)

**步骤 4**: 点击 Deploy，等待 2-3 分钟

---

### 方式 3: Vercel CLI（适合开发者）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_TOKEN production

# 5. 重新部署以应用环境变量
vercel --prod
```

---

## 📋 部署后必做的事

### 1. 更新 Supabase 允许的 URL

部署成功后，您会得到一个 Vercel URL（例如：`https://chinglish-wb.vercel.app`）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 进入您的项目 → Authentication → URL Configuration
3. 在 "Redirect URLs" 中添加：
   ```
   https://your-project.vercel.app/auth/callback
   ```

### 2. 测试核心功能

访问您的 Vercel URL，测试：
- [ ] 首页加载正常
- [ ] 搜索功能正常
- [ ] 词条详情页显示正确
- [ ] 用户注册/登录正常
- [ ] Google OAuth 登录正常
- [ ] 投稿功能正常

### 3. 检查性能

使用 Google PageSpeed Insights 测试：
```
https://pagespeed.web.dev/
```

目标：
- Performance > 80
- Accessibility > 90
- Best Practices > 90
- SEO > 90

---

## 🔧 遇到问题？

### 常见问题 1: 构建失败

**错误**: `Module not found`

**解决**:
```bash
rm -rf node_modules .next
npm install
npm run build
```

### 常见问题 2: 环境变量未生效

**错误**: 无法连接 Supabase

**解决**:
1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确保变量名称完全正确（区分大小写）
3. 重新部署项目

### 常见问题 3: Google OAuth 失败

**错误**: "redirect_uri_mismatch"

**解决**:
1. 打开 Google Cloud Console
2. 添加 `https://your-project.supabase.co/auth/v1/callback` 到允许的重定向 URI

---

## 📚 完整文档

- **详细部署指南**: [.project-docs/VERCEL_DEPLOYMENT_GUIDE.md](.project-docs/VERCEL_DEPLOYMENT_GUIDE.md)
- **环境变量配置**: [.project-docs/ENV_VARIABLES_TEMPLATE.md](.project-docs/ENV_VARIABLES_TEMPLATE.md)
- **总体部署计划**: [.project-docs/DEPLOYMENT_PLAN.md](.project-docs/DEPLOYMENT_PLAN.md)

---

## ✅ 部署清单

在部署前确认：

**代码准备**:
- [x] `npm run build` 成功
- [x] `npm run lint` 无错误
- [x] TypeScript 类型检查通过

**配置准备**:
- [x] `.env.local` 已添加到 `.gitignore`
- [x] `vercel.json` 已配置安全 headers
- [ ] 环境变量已准备（从 `.env.local` 复制）

**部署后**:
- [ ] Supabase 允许的 URL 已更新
- [ ] 所有核心功能测试通过
- [ ] 性能测试达标
- [ ] 多设备测试通过

---

## 🎉 准备好了！

选择上面任意一种方式开始部署。

**推荐**: 如果是第一次部署，使用 **方式 2 (GitHub + Vercel)**，自动化程度最高。

**需要帮助？** 查看详细文档或联系开发团队。
