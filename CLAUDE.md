# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

**Chinglish 黑白语言站** - 全球用户共同参与构建的中式英语查询、验证、分享、学习、文化数据库平台。项目愿景是让中式英语变成文化而不是笑话,让中国英语进入全球表达体系,让世界理解中国人的语言逻辑。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS + shadcn/ui theme system
- **数据库**: Supabase (PostgreSQL with Row Level Security)
- **部署**: Vercel
- **UI组件**: shadcn/ui (唯一的UI组件来源)

## 常用命令

### 开发命令
```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint
```

### 安装 shadcn/ui 组件
```bash
npx shadcn-ui@latest add <component-name>
# 示例: npx shadcn-ui@latest add button card dialog
```

### 数据库设置
1. 在 https://supabase.com 创建 Supabase 项目
2. 在 Supabase SQL Editor 中运行 `.project-docs/database/schema.sql`
3. 在 `.env.local` 中配置环境变量

## 架构设计

### 目录结构

```
app/                    # Next.js App Router 页面
├── page.tsx           # 首页 (服务端组件)
├── HomePageClient.tsx # 客户端首页逻辑
├── auth/              # 认证页面 (登录、注册)
├── term/[id]/         # 动态词条详情页
├── rankings/          # 榜单页面 (6个维度)
└── submit/            # 词条投稿页面

components/
├── ui/                # shadcn/ui 组件 (通过 CLI 安装)
├── features/          # 基于 ui/ 构建的业务组件
│   ├── auth/         # 认证相关组件
│   ├── search/       # 搜索组件
│   └── term/         # 词条展示组件
├── layout/           # 布局组件 (Header, Footer)
└── providers/        # React context providers

lib/
├── supabase/         # Supabase 集成
│   ├── client.ts    # 浏览器端客户端
│   ├── server.ts    # 服务端客户端
│   ├── auth.ts      # 认证工具函数
│   └── queries.ts   # 数据库查询函数
├── styles/          # 主题配置
├── types.ts         # TypeScript 类型定义
└── utils.ts         # 工具函数

.project-docs/        # 项目文档
├── conversations/   # 需求讨论记录
├── decisions/       # 架构决策记录 (ADR)
├── database/        # 数据库 schema 和迁移
└── progress/        # 开发里程碑
```

### 数据流

1. **服务端组件** (app/*.tsx) 使用 `lib/supabase/server.ts` 获取数据
2. **客户端组件** 使用 `lib/supabase/client.ts` 实现交互功能
3. **数据库查询** 集中在 `lib/supabase/queries.ts` 中
4. **类型定义** 在 `lib/types.ts` 中使用 camelCase (TypeScript),数据库使用 snake_case (PostgreSQL)
5. **转换函数** 在 queries.ts 中负责命名约定的转换

### 关键设计模式

#### 数据库字段命名约定
- **数据库**: snake_case (例如: `wrong_example`, `global_heat`)
- **TypeScript**: camelCase (例如: `wrongExample`, `globalHeat`)
- **转换**: 使用 queries.ts 中的 `transformTermFromDB()` 和 `transformSubmissionFromDB()`

#### Supabase 客户端使用
- **服务端组件**: 使用 `lib/supabase/server.ts` 的 `createClient()`
- **客户端组件**: 使用 `lib/supabase/client.ts` 的 `createClient()`
- **绝对不要** 混用服务端和客户端的 Supabase 实例

#### 组件组合
- 所有 UI 组件必须来自 shadcn/ui
- `components/features/` 中的业务组件组合 ui 组件
- 不要使用原生 HTML 元素构建复杂 UI (使用 shadcn/ui 基础组件)

#### 用户认证与 Profiles 表
- **双表结构**: auth.users (Supabase 管理) + public.profiles (应用数据)
- **触发器机制**: `on_auth_user_created` 触发器监听 auth.users INSERT 事件
  - 自动创建 profiles 表对应记录 (id, email, avatar_url, full_name)
  - OAuth 元数据从 `raw_user_meta_data` JSON 字段提取
  - 字段映射: `raw_user_meta_data->>'avatar_url'` → `profiles.avatar_url`
- **数据同步**: 新用户注册/OAuth 登录时立即同步,无需应用层代码
- **查询模式**: 应用层只需查询 profiles 表,通过 id FK 关联到 auth.users

## 关键约束

### UI 组件规则 (ADR-002)

**必须遵守:**
- 只能使用 shadcn/ui 作为 UI 组件来源
- 通过组合 ui/ 组件构建业务组件
- 使用 Tailwind CSS 类名进行样式设置
- 使用 CSS 变量定义颜色 (例如: `hsl(var(--error))`)

**绝对禁止:**
- 安装其他 UI 库 (Material-UI, Ant Design 等)
- 使用原生 HTML 元素构建复杂组件
- 硬编码颜色值 (例如: `text-red-500`)
- 编写内联样式或独立的 CSS 文件

### 主题系统 (熊猫黑白主题)

**配色方案:**
- 主色调: 黑色 (#1a1a1a) / 白色 (#FFFFFF)
- 错误色: #FF4D4F (Chinglish 标记)
- 成功色: #52C41A (正确表达)
- 警告色: #FA8C16
- 信息色: #1890FF

**主题切换:**
- 支持深色/浅色模式
- 所有组件通过 CSS 变量自动适配
- 主题配置位于 `lib/styles/`

### 数据库架构 (ADR-001)

**数据表:**
- `terms` - 已审核的 Chinglish 词条
- `submissions` - 待审核的用户投稿
- `term_stats` - 浏览/分享统计
- `profiles` - 用户资料 (id 外键关联到 auth.users.id)
  - 字段: id (UUID, PK), email, full_name, avatar_url, created_at, updated_at
  - 通过数据库触发器自动同步 auth.users 新用户
  - OAuth 元数据 (email, avatar_url, full_name) 来自第三方登录信息

**行级安全策略 (RLS):**
- 已审核词条公开可读
- 认证用户可以投稿
- 仅管理员可审批/拒绝

**关键函数:**
- `increment_term_views(term_id)` - 原子性浏览计数
- `increment_term_shares(term_id)` - 原子性分享计数

## 用户认证

**认证流程:**
- 使用 Supabase Auth 管理用户凭证 (auth.users 表)
- 应用数据存储在 public.profiles 表
- 数据库触发器自动同步: auth.users → profiles
  - 新用户注册/登录时自动创建 profiles 记录
  - OAuth 元数据 (email, avatar_url, full_name) 自动提取
- 会话管理通过 `lib/supabase/auth.ts`

**支持的认证方式:**
- 邮箱/密码注册登录
- Google OAuth (已配置并测试)
- Twitter/Facebook OAuth 接口已预留

## 环境变量

`.env.local` 中需要配置:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_AUTH_TOKEN=your_admin_token
```

## 重要文件

- [lib/types.ts](lib/types.ts) - 核心类型定义 (TermEntry, Submission)
- [lib/supabase/queries.ts](lib/supabase/queries.ts) - 所有数据库操作
- [.project-docs/database/schema.sql](.project-docs/database/schema.sql) - 完整数据库 schema
- [.project-docs/database/migrations/001_add_profiles_trigger.sql](.project-docs/database/migrations/001_add_profiles_trigger.sql) - Profiles 表自动同步触发器
- [.project-docs/database/migrations/002_backfill_existing_users.sql](.project-docs/database/migrations/002_backfill_existing_users.sql) - 回填现有用户到 profiles 表
- [.project-docs/decisions/](.project-docs/decisions/) - 架构决策记录

## 开发指南

1. **类型安全**: 使用 `lib/types.ts` 中的严格 TypeScript 类型
2. **数据获取**: 使用 `lib/supabase/queries.ts` 中的查询函数
3. **组件结构**: 遵循 ui/ → features/ → pages 层级
4. **文档记录**: 在 `.project-docs/decisions/` 中记录重要决策
5. **路径别名**: 使用 `@/` 进行导入 (在 tsconfig.json 中配置)

## 当前状态

MVP v0.2 (100% 完成):
- ✅ 核心页面: 首页、词条详情、榜单、投稿
- ✅ 用户认证 (支持邮箱和 Google OAuth)
- ✅ 真实 Supabase 数据库集成
- ✅ 已导入 500+ 测试词条
- ✅ Vercel 生产环境部署完成 (2025-12-24)
- ⚠️ Profiles 表自动同步触发器待执行 (迁移脚本已就绪)
  - 相关文档: `.project-docs/database/migrations/`
  - 执行前需完成: 添加 UserProfile 类型和 getUserProfile() 函数
  - 详细计划: `.project-docs/DETAILED_EXECUTION_PLAN.md`

下一阶段:
1. 执行数据库迁移 (profiles 表触发器) - 预计 15 分钟
2. 管理员审核面板开发