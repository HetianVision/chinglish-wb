# 🐼 Chinglish 黑白语言站

全球用户共同参与构建的中式英语查询、验证、分享、学习、文化数据库平台。

## 🎯 项目愿景

> **让中式英语变成文化，而不是笑话**
>
> **让中国英语进入全球表达体系**
>
> **让世界理解中国人的语言逻辑**

## 📁 项目结构

```
chinglish-wb/
├── .project-docs/       # 项目文档（对话记录、技术决策、设计系统）
├── app/                 # Next.js App Router
├── components/          # React组件
│   ├── ui/             # shadcn/ui组件
│   └── features/       # 业务组件
├── lib/                # 工具库
│   ├── supabase/      # Supabase配置
│   ├── styles/        # 样式和主题
│   └── types.ts       # TypeScript类型
├── hooks/             # React Hooks
├── public/            # 静态资源
└── supabase/          # Supabase配置和迁移
```

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui主题系统
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **UI组件**: shadcn/ui（唯一的设计系统来源）

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```bash
cp .env.example .env.local
```

需要配置：
- Supabase项目URL和密钥
- 管理员认证token

### 3. 设置Supabase数据库

在Supabase SQL Editor中运行：
```bash
.project-docs/database/schema.sql
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📦 安装shadcn/ui组件

项目使用shadcn/ui作为唯一的UI组件来源。安装新组件：

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
# ... 其他组件
```

## 🎨 设计系统

### 熊猫黑白主题

- **主色调**: 黑白灰（呼应熊猫 + 黑白名单主题）
- **错误色**: #FF4D4F（Chinglish标记）
- **成功色**: #52C41A（正确表达）
- **警告色**: #FA8C16
- **信息色**: #1890FF

### 主题切换

支持深色/浅色模式自动切换，所有组件自动适配。

## 📖 文档

详细文档位于 `.project-docs/` 目录：

- [对话记录](/.project-docs/conversations/)
- [技术决策](/.project-docs/decisions/)
- [数据库设计](/.project-docs/database/)
- [设计系统](/.project-docs/design-system/)
- [API文档](/.project-docs/api-docs/)
- [开发进度](/.project-docs/progress/)

## 🤝 贡献指南

1. 所有UI组件必须使用shadcn/ui
2. 遵循熊猫黑白配色主题
3. 使用TypeScript类型定义
4. 记录重要决策到 `.project-docs/decisions/`

## 📝 开发状态

### ✅ 已完成（MVP v0.2 - 90%）

#### Phase 1: 项目基础
- [x] 项目初始化
- [x] 配置shadcn/ui主题系统（18个组件）
- [x] 数据库schema设计（PostgreSQL + RLS）
- [x] Supabase客户端集成

#### Phase 2: 核心页面
- [x] 首页（搜索 + 热门/高风险/最新榜单）
- [x] 词条详情页（完整信息展示 + 相关推荐）
- [x] 榜单页面（6个维度排行）
- [x] 投稿页面（完整表单 + 验证）

#### Phase 3: UI组件
- [x] TermCard（词条卡片）
- [x] SearchBar（搜索栏）
- [x] Header（导航）
- [x] Footer（页脚）

#### Phase 4: 数据集成
- [x] 连接真实 Supabase 数据库
- [x] 替换模拟数据为真实查询
- [x] 导入 500 条测试词条

#### Phase 5: 用户认证
- [x] 用户注册/登录（邮箱）
- [x] Google OAuth 登录
- [x] 预留 Twitter / Facebook 登录接口
- [x] 用户会话管理

### ⏳ 待完成

#### Phase 6: 线上部署（当前目标）
- [ ] Vercel 部署配置
- [ ] 环境变量配置
- [ ] 域名和 DNS 设置
- [ ] 生产环境测试

#### Phase 7: 管理功能
- [ ] 管理员审核面板
- [ ] 投稿审批/拒绝
- [ ] 数据统计

#### Phase 8: 扩展功能
- [ ] 分享卡片生成
- [ ] 统计追踪（浏览/分享）
- [ ] 用户个人主页

## 🚀 快速开始

### 方式1：本地开发（使用模拟数据）

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:3000
# 可以完整体验所有功能（使用模拟数据）
```

### 方式2：连接真实数据库

详细步骤请查看：[QUICK_START.md](QUICK_START.md)

简要步骤：

```bash
# 1. 创建 Supabase 项目
# https://supabase.com

# 2. 运行数据库 schema
# 在 SQL Editor 中执行 .project-docs/database/schema.sql

# 3. 配置环境变量
cp .env.example .env.local
# 填写 Supabase URL 和 API Keys

# 4. 启动开发服务器
npm run dev
```

## 📖 文档导航

| 文档 | 描述 |
|------|------|
| [QUICK_START.md](QUICK_START.md) | 快速开始指南 |
| [PROJECT_SUMMARY.md](.project-docs/PROJECT_SUMMARY.md) | 项目总结和技术亮点 |
| [SUPABASE_SETUP.md](.project-docs/database/SUPABASE_SETUP.md) | Supabase 详细配置指南 |
| [milestones.md](.project-docs/progress/milestones.md) | 开发进度和里程碑 |

更多文档位于 `.project-docs/` 目录：

- [对话记录](.project-docs/conversations/) - 需求讨论和决策过程
- [技术决策](.project-docs/decisions/) - ADR 架构决策记录
- [数据库设计](.project-docs/database/) - Schema 和迁移
- [开发进度](.project-docs/progress/) - 里程碑追踪
