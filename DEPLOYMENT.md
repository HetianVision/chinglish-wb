# Chinglish WB - Vercel 部署指南

## 📋 部署前检查清单

- ✅ Git 仓库已初始化
- ✅ 初始提交已创建
- ✅ `vercel.json` 配置文件已创建
- ✅ 生产构建测试通过 (`npm run build`)
- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过
- ⏳ 待推送到 GitHub
- ⏳ 待部署到 Vercel

## 🚀 部署步骤

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库:
   - **仓库名**: `chinglish-wb` (或你喜欢的名称)
   - **可见性**: Public 或 Private
   - **不要** 初始化 README、.gitignore 或 license (本地已有)

3. 复制仓库 URL (例如: `https://github.com/yourusername/chinglish-wb.git`)

### 2. 推送代码到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/yourusername/chinglish-wb.git

# 推送代码
git push -u origin main
```

### 3. 部署到 Vercel

#### 方式 A: 通过 Vercel Dashboard (推荐)

1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 选择你的 GitHub 仓库 `chinglish-wb`
4. 配置项目:
   - **Framework Preset**: Next.js (自动检测)
   - **Root Directory**: `./` (默认)
   - **Build Command**: `npm run build` (自动检测)
   - **Output Directory**: `.next` (自动检测)

5. **配置环境变量** (重要!):
   点击 "Environment Variables" 添加以下变量:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://bdndxbcmdvsgmapmgalh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Dm-D8ZQq1XOLCOIFNDRlKw_fAnQi6jT
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_1cNBahlyosXdiizmV_mqnA_UceHnqQm
   ADMIN_TOKEN=chinglish-admin-2024-secure-token
   ```

6. 点击 "Deploy" 开始部署

#### 方式 B: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 按提示操作:
# - Set up and deploy? Yes
# - Which scope? 选择你的账户
# - Link to existing project? No
# - What's your project's name? chinglish-wb
# - In which directory is your code located? ./
# - Want to override the settings? No

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_TOKEN

# 生产部署
vercel --prod
```

### 4. 配置 Supabase OAuth 回调 URL

部署成功后,你会得到一个 Vercel URL (例如: `https://chinglish-wb.vercel.app`)

1. 访问 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **Authentication** → **URL Configuration**
4. 添加以下 URL:
   - **Site URL**: `https://chinglish-wb.vercel.app`
   - **Redirect URLs**:
     - `https://chinglish-wb.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (保留用于本地开发)

5. 进入 **Authentication** → **Providers** → **Google**
6. 在 Google Cloud Console 中添加授权重定向 URI:
   - `https://bdndxbcmdvsgmapmgalh.supabase.co/auth/v1/callback`

### 5. 部署后验证

访问你的 Vercel URL 并测试以下功能:

- ✅ 首页加载正常
- ✅ 词条列表显示正常
- ✅ 搜索功能工作
- ✅ 词条详情页可访问
- ✅ 榜单页面正常
- ✅ Google OAuth 登录成功
- ✅ 投稿功能正常
- ✅ 响应式设计在移动端正常

## 🔧 常见问题

### 问题 1: 构建失败 - TypeScript 错误

**解决方案**: 在本地运行 `npm run build` 确保没有类型错误

### 问题 2: 环境变量未生效

**解决方案**:
1. 检查 Vercel Dashboard → Settings → Environment Variables
2. 确保所有变量都已添加
3. 重新部署: `vercel --prod` 或在 Dashboard 点击 "Redeploy"

### 问题 3: OAuth 登录失败

**解决方案**:
1. 检查 Supabase 的 Redirect URLs 配置
2. 确保 Google Cloud Console 的授权重定向 URI 正确
3. 检查浏览器控制台的错误信息

### 问题 4: 数据库连接失败

**解决方案**:
1. 检查 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正确
2. 确保 Supabase 项目处于活跃状态
3. 检查 Row Level Security (RLS) 策略是否正确

### 问题 5: 页面加载慢

**解决方案**:
1. 检查 Vercel 的 Region 设置 (推荐使用 `hkg1` 香港节点)
2. 考虑启用 Vercel Edge Functions
3. 优化图片和静态资源

## 📊 性能优化建议

### 1. 启用 Vercel Analytics

```bash
npm install @vercel/analytics
```

在 `app/layout.tsx` 中添加:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. 启用 Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

### 3. 配置 ISR (Incremental Static Regeneration)

在词条详情页 `app/term/[id]/page.tsx` 中添加:

```typescript
export const revalidate = 3600; // 每小时重新生成
```

### 4. 配置 CDN 缓存

在 `next.config.ts` 中添加:

```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      ],
    },
  ],
};
```

## 🔐 安全建议

1. **定期更新依赖**: `npm audit` 和 `npm update`
2. **启用 Vercel 的 Security Headers**
3. **配置 CORS 策略**
4. **定期轮换 API 密钥**
5. **监控 Supabase 的使用量和异常访问**

## 📈 监控和日志

### Vercel Dashboard

- **Deployments**: 查看部署历史和状态
- **Analytics**: 查看访问量和用户行为
- **Logs**: 查看运行时日志和错误
- **Speed Insights**: 查看性能指标

### Supabase Dashboard

- **Database**: 监控数据库性能
- **Auth**: 查看用户登录统计
- **Logs**: 查看 API 请求日志
- **Usage**: 监控资源使用情况

## 🎯 下一步计划

- [ ] 配置自定义域名
- [ ] 启用 Vercel Analytics
- [ ] 实现管理员审核面板
- [ ] 添加 SEO 优化 (meta tags, sitemap)
- [ ] 配置 OG 图片生成
- [ ] 实现邮件通知功能
- [ ] 添加用户反馈系统
- [ ] 实现词条收藏功能

## 📞 支持

如有问题,请查看:
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)

---

**部署时间**: 2025-12-24
**版本**: MVP v0.2
**状态**: ✅ 准备就绪
