# Chinglish 黑白语言站 - 快速开始

欢迎使用 Chinglish 黑白语言站！这是一个全球用户共同参与构建的中式英语查询、验证、分享、学习平台。

## 🎯 当前状态

✅ **MVP 核心功能已完成** (80%)
- 首页、词条详情、榜单、投稿 - 全部页面已开发完成
- 使用模拟数据运行，可以完整体验所有功能
- 准备好连接 Supabase 数据库

## 🚀 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 3. 浏览功能

- **首页**: 搜索 + 三个榜单（热门/高风险/最新）
- **词条详情**: 点击任意词条卡片
- **榜单页**: 导航栏点击「榜单」，查看6个维度排行
- **投稿页**: 导航栏点击「投稿」，提交新词条

## 📊 模拟数据

当前使用6个示例词条：

1. **add oil** - 牛津收录 ✅
2. **long time no see** - 牛津收录 ✅
3. **no can do** - 牛津收录 ✅
4. **people mountain people sea** - 超高趣味指数
5. **good good study, day day up** - 经典网络用语
6. **you can you up, no can no BB** - 高风险表达

## 🔌 连接真实数据库

### 准备工作

1. 注册 [Supabase](https://supabase.com) 账号
2. 创建新项目
3. 按照步骤配置数据库

### 详细步骤

请查看完整指南：

📖 [`.project-docs/database/SUPABASE_SETUP.md`](.project-docs/database/SUPABASE_SETUP.md)

简要步骤：

```bash
# 1. 创建 .env.local 文件
cp .env.example .env.local

# 2. 填写 Supabase 凭证
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. 在 Supabase SQL Editor 运行
# .project-docs/database/schema.sql

# 4. 重启开发服务器
npm run dev
```

## 📁 项目结构

```
chinglish-wb/
├── app/                    # Next.js 页面
│   ├── page.tsx           # 首页
│   ├── term/[id]/         # 词条详情
│   ├── rankings/          # 榜单
│   └── submit/            # 投稿
│
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── features/          # 业务组件
│   └── layout/            # Header, Footer
│
├── lib/
│   ├── supabase/          # 数据库集成
│   ├── styles/            # 主题和样式
│   └── types.ts           # 类型定义
│
└── .project-docs/         # 项目文档
```

## 🎨 技术栈

- **Next.js 15** - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化样式
- **shadcn/ui** - 组件库（唯一UI来源）
- **Supabase** - PostgreSQL 数据库

## 📚 文档导航

| 文档 | 描述 |
|------|------|
| [PROJECT_SUMMARY.md](.project-docs/PROJECT_SUMMARY.md) | 项目总结和技术亮点 |
| [SUPABASE_SETUP.md](.project-docs/database/SUPABASE_SETUP.md) | Supabase 集成指南 |
| [milestones.md](.project-docs/progress/milestones.md) | 开发进度和里程碑 |
| [schema.sql](.project-docs/database/schema.sql) | 数据库设计 |

## 🔧 常用命令

```bash
# 开发
npm run dev           # 启动开发服务器
npm run build         # 构建生产版本
npm run start         # 运行生产版本
npm run lint          # 代码检查

# shadcn/ui
npx shadcn@latest add [component]  # 添加组件
```

## 🎯 下一步

1. **连接 Supabase** - 按照 SUPABASE_SETUP.md 操作
2. **导入初始数据** - 50-100 条 Chinglish 词条
3. **测试完整流程** - 搜索、详情、投稿
4. **部署到 Vercel** - 一键部署

## 🐼 设计理念

- **熊猫黑白主题** - 简洁、优雅、专业
- **寓教于乐** - 在趣味中学习正确表达
- **社区驱动** - 全球用户共同参与
- **包容开放** - 记录语言的演变

## 📞 需要帮助？

- **项目文档**: `.project-docs/` 文件夹
- **技术决策**: `.project-docs/decisions/`
- **开发进度**: `.project-docs/progress/milestones.md`

---

**Happy Coding! 🚀**

让我们一起打造最有趣的 Chinglish 学习平台！
