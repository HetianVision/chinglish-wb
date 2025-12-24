# Vercel 部署指南 - Chinglish 黑白语言站

**状态**: ✅ 已准备好部署
**构建测试**: ✅ 通过
**安全配置**: ✅ 已优化

---

## 🚀 快速部署（推荐方式）

### 方法 1: GitHub 自动部署（推荐）

1. **将代码推送到 GitHub**
   ```bash
   git add .
   git commit -m "ready for production deployment"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Add New Project"
   - 选择您的 GitHub 仓库 `ChinglishWB`
   - Vercel 会自动检测到 Next.js 项目

3. **配置环境变量**（重要！）
   在 Vercel 项目设置中添加以下环境变量：

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
   SUPABASE_SERVICE_ROLE_KEY=你的Supabase服务密钥
   ADMIN_TOKEN=你的管理员Token
   ```

   ⚠️ **从哪里获取这些值？**
   - 打开本地项目的 `.env.local` 文件
   - 复制对应的值到 Vercel

4. **点击 Deploy**
   - Vercel 会自动运行 `npm install` 和 `npm run build`
   - 大约 2-3 分钟后部署完成
   - 您会得到一个 `https://your-project.vercel.app` 域名

---

### 方法 2: Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **初始化项目**
   ```bash
   cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
   vercel
   ```

   CLI 会询问几个问题：
   - Set up and deploy? → **Yes**
   - Which scope? → 选择您的账户
   - Link to existing project? → **No**
   - What's your project's name? → **chinglish-wb**（或自定义名称）
   - In which directory is your code located? → **.**
   - Override settings? → **No**

4. **添加环境变量**
   ```bash
   # 从 .env.local 复制值，然后运行：
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   vercel env add ADMIN_TOKEN production
   ```

   每次运行命令后，粘贴对应的值。

5. **部署到生产环境**
   ```bash
   vercel --prod
   ```

---

## 📋 部署前检查清单

在执行部署前，请确认：

### ✅ 代码质量
- [x] `npm run build` 构建成功
- [x] `npm run lint` 无错误
- [x] TypeScript 类型检查通过
- [ ] 已移除调试代码（console.log）

### ✅ 环境变量
- [x] `.env.local` 已添加到 `.gitignore`
- [x] 所有敏感密钥未提交到 Git
- [ ] Vercel 环境变量已配置（部署时配置）

### ✅ Supabase 配置
- [x] 数据库表已创建（terms, submissions, term_stats, profiles）
- [x] RLS 策略已启用
- [ ] Supabase 允许的 URL 已添加 Vercel 域名

### ✅ 安全配置
- [x] `vercel.json` 安全 headers 已配置
- [x] XSS 防护已启用
- [x] CORS 策略已设置

---

## 🔧 环境变量详细说明

### 必需的环境变量

| 变量名 | 说明 | 从哪里获取 |
|--------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | Supabase Dashboard → Settings → API |
| `ADMIN_TOKEN` | 管理员认证 Token | 您自己设置的随机字符串 |

### 可选的环境变量

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Vercel Analytics（自动生成） |
| `RESEND_API_KEY` | 邮件通知服务（未来功能） |

---

## 🌐 部署后配置

### 1. 更新 Supabase 允许的 URL

部署完成后，需要在 Supabase 中允许 Vercel 域名：

1. 打开 Supabase Dashboard
2. 进入 Authentication → URL Configuration
3. 在 "Site URL" 和 "Redirect URLs" 中添加：
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/auth/callback
   ```

### 2. Google OAuth 重定向 URI

如果使用 Google OAuth，需要更新 Google Cloud Console：

1. 打开 [Google Cloud Console](https://console.cloud.google.com)
2. 进入您的项目 → APIs & Services → Credentials
3. 编辑 OAuth 2.0 客户端 ID
4. 在 "Authorized redirect URIs" 中添加：
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

### 3. 域名配置（可选）

如果您有自定义域名：

1. 在 Vercel Dashboard → Settings → Domains
2. 点击 "Add Domain"
3. 输入您的域名（例如：`chinglish-wb.com`）
4. 按照提示在域名注册商处更新 DNS 记录
5. Vercel 会自动申请 SSL 证书

---

## 🧪 部署后测试清单

部署完成后，请测试以下功能：

### 核心功能
- [ ] 首页正常加载，显示词条列表
- [ ] 搜索功能正常工作
- [ ] 词条详情页正常显示
- [ ] 榜单页面（6个维度）正常排序
- [ ] 投稿表单可以正常提交

### 用户认证
- [ ] 邮箱注册功能正常
- [ ] 邮箱登录功能正常
- [ ] Google OAuth 登录正常
- [ ] 登出功能正常

### 性能测试
- [ ] 首页加载时间 < 3秒
- [ ] Lighthouse 性能分数 > 80
- [ ] 移动端响应式布局正常

### 多设备测试
- [ ] Chrome 桌面版
- [ ] Safari 桌面版
- [ ] Chrome 移动版
- [ ] Safari iOS
- [ ] Android 浏览器

---

## 🔍 常见问题排查

### 问题 1: 构建失败 "Module not found"

**原因**: 依赖未正确安装

**解决方案**:
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2: 环境变量未生效

**原因**: Vercel 环境变量配置错误

**解决方案**:
1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确保变量名称完全一致（大小写敏感）
3. 重新部署项目

### 问题 3: Supabase 连接失败

**原因**:
- 环境变量错误
- Supabase URL 未添加到允许列表

**解决方案**:
1. 检查 `.env.local` 中的值是否正确
2. 在 Supabase Dashboard 中添加 Vercel 域名到允许列表
3. 确认 RLS 策略已正确配置

### 问题 4: Google OAuth 重定向失败

**原因**: 重定向 URI 未在 Google Console 中配置

**解决方案**:
1. 打开 Google Cloud Console
2. 添加 `https://your-project.supabase.co/auth/v1/callback`
3. 等待几分钟让配置生效

### 问题 5: 页面加载慢

**原因**:
- 未启用缓存
- 图片未优化

**解决方案**:
1. 检查 `vercel.json` 配置
2. 使用 `next/image` 组件替代 `<img>`
3. 启用 Next.js ISR（增量静态再生成）

---

## 📊 监控和分析

### Vercel Analytics（推荐）

1. 在 Vercel Dashboard 中启用 Analytics
2. 自动追踪：
   - 页面访问量
   - 加载时间
   - Core Web Vitals
   - 错误率

### 自定义监控（可选）

可以集成：
- **Sentry**: 错误追踪
- **Google Analytics**: 用户行为分析
- **Posthog**: 产品分析

---

## 🎯 下一步

部署成功后：

1. **测试所有功能** - 使用上面的测试清单
2. **监控性能** - 查看 Vercel Analytics
3. **收集反馈** - 邀请用户试用
4. **迭代优化** - 根据反馈改进

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 Vercel 部署日志：Vercel Dashboard → Deployments → 点击失败的部署
2. 检查浏览器控制台错误
3. 查看 Supabase 日志：Supabase Dashboard → Logs
4. 参考 Next.js 文档：https://nextjs.org/docs

---

**准备好了吗？开始部署吧！** 🚀
