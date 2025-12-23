# Chinglish 黑白语言站 - Vercel 线上部署计划

**项目当前状态**: MVP v0.2（90% 完成）
- ✅ Supabase 数据库已连接，500 条测试数据已导入
- ✅ 用户认证已完成（邮箱注册/登录 + Google OAuth）
- ✅ 核心功能已实现（搜索、投稿、榜单、详情页）
- 🎯 下一目标：部署到 Vercel

---

## 整体部署流程架构

```
本地开发环境 
     ↓
性能优化 + 安全检查
     ↓
Vercel 部署 (配置 + 环境变量)
     ↓
域名 + SSL (可选自定义域名)
     ↓
多设备测试 + 线上验证
     ↓
🚀 正式上线
```

---

## Phase 6: 线上部署（优先级：第一）

### Step 1: 本地最终盘点 (1-2 小时)

**目标**: 确保代码质量和完整性

- [ ] **代码审查**
  - 运行 `npm run lint` 确保没有 linting 错误
  - 运行 `npm run build` 确保构建成功
  - 检查是否有 console.log 调试代码需要清理
  - TypeScript 类型检查通过

- [ ] **环境变量安全**
  - 确认 `.env.local` 已添加到 `.gitignore`
  - 所有敏感密钥（Supabase Key、Google OAuth Secret）未提交到 Git
  - 检查代码中是否硬编码了任何密钥

- [ ] **功能测试（本地）**
  - 首页搜索功能正常
  - 投稿页表单完整
  - 用户登录流程（邮箱 + Google）正常
  - 词条详情页正常显示
  - 榜单页面正常排序

### Step 2: 性能优化 (1-2 小时)

**目标**: Core Web Vitals 达到绿色标准（LCP < 2.5s, FID < 100ms, CLS < 0.1）

- [ ] **Next.js 构建优化**
  - 检查 `next.config.ts` 是否有压缩和缓存配置
  - 启用静态生成 (Static Generation) 对于不变的页面
  - 考虑使用 ISR (Incremental Static Regeneration) 对于榜单页

- [ ] **图片优化**
  - 使用 `next/image` 组件替代原生 `<img>` 标签
  - 设置合理的 `width` 和 `height`
  - 考虑 AVIF/WebP 格式

- [ ] **第三方脚本**
  - 移除不必要的分析工具（如果有的话）
  - Google Analytics 配置为异步加载
  - 考虑使用 Vercel Analytics（无需额外加载）

- [ ] **代码分割 + Lazy Loading**
  - 确认大型组件使用 `dynamic()` 进行动态导入
  - 检查 Supabase 查询是否需要分页

### Step 3: 安全检查 (1 小时)

**目标**: 确保生产环境安全性

- [ ] **Supabase RLS 策略验证**
  - 确认 `terms` 表的 RLS 政策允许公开读取
  - 确认 `submissions` 表的 RLS 政策正确限制只有提交者才能查看
  - 确认 `users` 表的 RLS 政策保护隐私数据

- [ ] **CORS 和 Content Security Policy**
  - 检查 Supabase CORS 设置是否包含 Vercel 部署域名
  - 考虑配置 CSP header 防止 XSS 攻击

- [ ] **敏感数据处理**
  - 确认 API 响应不会泄露用户密码或密钥
  - 确认只有登录用户才能看到个人信息

- [ ] **环境变量管理**
  - 准备 Vercel 环境变量清单（见下面）

### Step 4: Vercel 部署配置 (1-2 小时)

**目标**: 配置 Vercel 项目并成功首次部署

#### 4.1 在 Vercel 上创建项目

```bash
# 如果你还没安装 Vercel CLI
npm install -g vercel

# 在项目根目录登录 + 部署
vercel login
vercel
```

或者直接在 [vercel.com](https://vercel.com) 上连接你的 GitHub 仓库。

#### 4.2 配置环境变量

需要在 Vercel Dashboard 上设置以下环境变量（Settings → Environment Variables）：

```bash
# Supabase 相关（从你的 Supabase 项目复制）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth（如果使用）
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
# 注：OAuth Secret 通常不需要在前端配置，除非你有自己的 backend

# 其他可选
NEXT_PUBLIC_API_URL=https://your-domain.com  # 后续配置自定义域名后更新
```

**重要**: 这些变量在 Vercel 上是加密存储的，且不会被公开。

#### 4.3 Vercel 构建设置

默认设置通常足够，但验证一下：

- **Framework Preset**: Next.js ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

#### 4.4 首次部署

```bash
# 从本地部署（确保代码最新）
vercel --prod
```

或者连接 GitHub，每次 push 到主分支自动部署。

### Step 5: 域名配置（可选，取决于你是否有域名）(30 分钟)

**目标**: 配置自定义域名（例如 chinglish-wb.com）

如果你已经有域名：

- [ ] **在 Vercel Dashboard 配置域名**
  - 进入项目 Settings → Domains
  - 添加你的域名
  - Vercel 会提示你需要在域名注册商更新 DNS 记录

- [ ] **更新 DNS 记录**
  - 根据 Vercel 提示，在你的域名注册商（例如 GoDaddy、阿里云）更新 CNAME 或 A 记录
  - DNS 生效通常需要 5-48 小时

- [ ] **SSL 证书**
  - Vercel 自动为自定义域名申请 Let's Encrypt SSL 证书（免费）

如果暂时没有域名，Vercel 会自动分配一个 `*.vercel.app` 域名，可以先用着。

### Step 6: 多设备测试 (1-2 小时)

**目标**: 确保在不同设备和浏览器上都能正常工作

- [ ] **桌面浏览器测试**
  - Chrome / Firefox / Safari 最新版本
  - 检查响应式布局、弹出框显示、输入框焦点

- [ ] **移动设备测试**
  - iPhone / Android（可用浏览器开发者工具模拟）
  - 测试触屏交互、输入法、横竖屏切换

- [ ] **网络状态测试**
  - 在浏览器开发者工具中模拟 3G / 4G 网络
  - 确保加载动画正常显示

- [ ] **功能核心路径测试**
  1. 首页加载 + 搜索词条
  2. 点击词条进入详情页
  3. 用邮箱注册 / 登录
  4. 用 Google 快速登录
  5. 点击投稿，填表提交
  6. 查看榜单

### Step 7: 错误监控 + 日志 (30 分钟)

**目标**: 上线后能快速发现和修复问题

- [ ] **Vercel Analytics（推荐）**
  - Vercel Dashboard → Analytics
  - 自动追踪页面加载时间、错误率
  - 免费版本足够了

- [ ] **Sentry（可选，用于错误追踪）**
  - 注册 [sentry.io](https://sentry.io)
  - 安装 SDK：`npm install --save @sentry/nextjs`
  - 配置 `sentry.config.js` 和 `sentry.server.config.js`
  - 在 Vercel 环境变量中添加 Sentry DSN

---

## Phase 7: 管理员审核面板（优先级：第二）

上线后逐步完成，不阻塞部署：

- [ ] 管理员登录页（基于 Supabase Auth）
- [ ] 待审核投稿列表
- [ ] 审核界面（批准 / 拒绝 / 编辑）
- [ ] 审核统计仪表板

---

## Phase 8: 扩展功能（优先级：第三）

- [ ] 分享卡片生成
- [ ] 浏览 / 分享统计追踪
- [ ] Twitter / Facebook OAuth 完整对接
- [ ] 用户个人主页

---

## 部署前清单

在运行 `vercel --prod` 之前，请检查：

```
预检查:
- [ ] npm run lint 无错误
- [ ] npm run build 成功
- [ ] 本地 npm run dev 功能完整
- [ ] .env.local 已 .gitignore
- [ ] 没有 console.log 或调试代码

环境变量:
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_GOOGLE_CLIENT_ID (如有)

Supabase:
- [ ] RLS 政策已验证
- [ ] 生产数据已备份

部署后:
- [ ] 访问部署链接测试
- [ ] 核心功能都能用
- [ ] 多设备测试通过
```

---

## 时间预估

| Phase | 任务 | 预计时间 |
|-------|------|--------|
| 1 | 本地盘点 | 1-2h |
| 2 | 性能优化 | 1-2h |
| 3 | 安全检查 | 1h |
| 4 | Vercel 配置 | 1-2h |
| 5 | 域名配置 | 0.5h（可选） |
| 6 | 多设备测试 | 1-2h |
| 7 | 错误监控 | 0.5h |
| **总计** | | **6-11h** |

---

## 下一步

👉 **请你确认**：

1. 你有 Vercel 账户吗？（没有的话需要注册）
2. 你有自定义域名吗？（可选，可以先用 `.vercel.app` 域名）
3. Google OAuth 凭证准备好了吗？
4. 你想在我的指导下一步步完成，还是有其他问题？

**一旦你同意，我会逐项提供具体的代码改动和命令**。

