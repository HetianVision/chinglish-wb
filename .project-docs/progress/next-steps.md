# 接下来的开发计划

## 📍 当前进度总结

### ✅ 已完成的里程碑

**Milestone 1-3.5 全部完成**：
- ✅ 项目基础架构搭建
- ✅ Supabase PostgreSQL 集成
- ✅ 所有核心页面开发（首页、详情、榜单、投稿）
- ✅ 真实数据库连接
- ✅ 500条测试数据导入
- ✅ **用户已成功访问网站，看到测试数据**

### 🎯 当前状态

**网站运行状态**：
- 🌐 开发服务器：http://localhost:3001
- 📊 数据库：Supabase PostgreSQL（500条测试数据）
- ✅ 所有页面正常工作
- ✅ 投稿功能可用（提交到 submissions 表）

---

## 📋 Milestone 4: 管理员审核系统

### 功能概述

开发管理员后台，用于审核用户投稿的 Chinglish 词条。

### 核心功能

1. **管理员身份验证**
   - 使用环境变量 `ADMIN_TOKEN` 进行简单认证
   - Next.js middleware 保护 `/admin` 路由
   - 登录页面（输入token）

2. **待审核列表**
   - 显示所有 `status = 'pending'` 的投稿
   - 表格展示关键信息：
     - Chinglish 表达
     - 错误示例 / 正确表达
     - 分类标签
     - 投稿者信息
     - 提交时间
   - 分页功能（每页10-20条）

3. **审核操作**
   - **批准（Approve）**：
     - 投稿数据转移到 `terms` 表
     - 更新 `submissions` 状态为 `approved`
     - 记录审核时间和审核者
   - **拒绝（Reject）**：
     - 更新 `submissions` 状态为 `rejected`
     - 可选填写拒绝原因
   - **编辑后批准**：
     - 可以在批准前修改内容
     - 修正错误或优化表达

4. **审核统计**
   - 待审核数量
   - 今日审核数量
   - 累计批准/拒绝数量
   - 审核通过率

### 技术实现

**页面结构**：
```
app/admin/
├── layout.tsx              # 管理员布局（侧边栏）
├── login/
│   └── page.tsx           # 登录页（输入ADMIN_TOKEN）
├── page.tsx               # 审核主页（待审核列表）
└── api/
    ├── approve/route.ts   # 批准API
    └── reject/route.ts    # 拒绝API
```

**核心组件**：
```
components/features/admin/
├── SubmissionTable.tsx    # 投稿列表表格
├── ReviewActions.tsx      # 审核操作按钮组
├── EditDialog.tsx         # 编辑对话框
└── StatsCards.tsx         # 统计卡片
```

**数据库查询函数**（新增到 `lib/supabase/queries.ts`）：
```typescript
// 获取待审核列表
export async function getPendingSubmissions(supabase, options)

// 批准投稿
export async function approveSubmission(supabase, submissionId, reviewNote)

// 拒绝投稿
export async function rejectSubmission(supabase, submissionId, reviewNote)

// 获取审核统计
export async function getReviewStats(supabase)
```

**RPC 函数**（新增到 `schema.sql`）：
```sql
CREATE OR REPLACE FUNCTION approve_submission(
  submission_uuid UUID,
  reviewer TEXT,
  note TEXT DEFAULT NULL
) RETURNS JSON AS $$
  -- 1. 从 submissions 表获取数据
  -- 2. 插入到 terms 表
  -- 3. 更新 submissions 状态为 approved
  -- 4. 返回结果
$$ LANGUAGE plpgsql;
```

### 预计开发时间

- **登录验证**：30分钟
- **待审核列表**：1小时
- **审核操作**：1小时
- **统计面板**：30分钟
- **测试和优化**：30分钟

**总计**：约 **3-4小时**

---

## 📤 Milestone 5: 分享功能

### 功能概述

生成精美的分享卡片图片，方便用户分享 Chinglish 词条到社交媒体。

### 核心功能

1. **分享卡片设计**
   - 黑白熊猫主题
   - 包含：Chinglish 表达、正确表达、评分指标
   - 底部水印：网站名称 + 二维码（可选）

2. **卡片生成**
   - 使用 `html-to-image` 库
   - 在浏览器端渲染为图片
   - 提供下载功能

3. **分享按钮**
   - 每个词条详情页添加"分享"按钮
   - 点击生成图片预览
   - 支持：下载图片 / 复制链接

4. **分享统计**
   - 记录分享次数（已有 `incrementTermShares` 函数）
   - 展示在词条详情页

### 技术实现

**组件**：
```typescript
// components/features/share/ShareCard.tsx
// 可复用的分享卡片组件

// components/features/share/ShareDialog.tsx
// 分享对话框（预览 + 下载）
```

**API**：
```typescript
// app/api/share/route.ts
// 服务端生成图片（可选）
```

### 预计开发时间

- **卡片设计**：1小时
- **图片生成**：1小时
- **UI集成**：30分钟

**总计**：约 **2-3小时**

---

## 🚀 Milestone 6: 部署到 Vercel

### 功能概述

将项目部署到生产环境，提供公网访问。

### 部署步骤

1. **代码优化**
   - 清理 console.log
   - 优化图片和资源
   - 构建测试（`npm run build`）

2. **环境变量配置**
   - 在 Vercel 添加：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ADMIN_TOKEN`

3. **Vercel 部署**
   - 连接 GitHub 仓库
   - 自动部署
   - 获取生产URL

4. **生产数据准备**
   - 运行 `cleanup.sql` 清理测试数据
   - 准备真实初始数据（50-100条）
   - 配置 Supabase 生产环境

5. **域名配置（可选）**
   - 绑定自定义域名
   - 配置 SSL 证书

### 预计时间

- **代码准备**：1小时
- **部署配置**：30分钟
- **数据准备**：1小时

**总计**：约 **2-3小时**

---

## 📊 总体时间规划

| 里程碑 | 功能 | 预计时间 | 优先级 |
|--------|------|----------|--------|
| Milestone 4 | 管理员审核系统 | 3-4小时 | 🔴 高 |
| Milestone 5 | 分享功能 | 2-3小时 | 🟡 中 |
| Milestone 6 | Vercel 部署 | 2-3小时 | 🟢 中 |

**MVP 完整版预计总时间**：1-2天

---

## 🎯 下一步行动

### 立即开始：Milestone 4 - 管理员审核系统

**第一步**：创建管理员路由和基础页面
- 创建 `/app/admin` 文件夹
- 开发登录验证机制
- 搭建管理员布局

**第二步**：开发待审核列表
- 扩展 Supabase 查询函数
- 创建投稿列表表格组件
- 实现分页

**第三步**：实现审核操作
- 创建批准/拒绝 RPC 函数
- 开发审核操作 UI
- 添加编辑功能

**第四步**：统计面板
- 实现审核统计查询
- 创建统计卡片组件

---

## 📞 需要确认

开始开发管理员审核系统前，请确认：

1. **是否现在开始 Milestone 4？**
   - 我可以立即开始开发管理员审核系统

2. **审核流程偏好**：
   - 是否需要编辑功能？（批准前可修改内容）
   - 拒绝时是否必须填写原因？

3. **认证方式**：
   - 简单 token 认证（已配置 ADMIN_TOKEN）足够吗？
   - 还是需要更复杂的用户系统？

4. **实时更新**：
   - 是否需要 Supabase Realtime？（新投稿自动出现）
   - 还是手动刷新即可？

**请告诉我您的决定，我立即开始开发！** 🚀
