# 用户认证系统实施计划

**状态**: 实施中
**日期**: 2024-12-23
**前置条件**: ✅ Google OAuth 已在 Supabase 配置完成

---

## 📋 实施概览

### 目标
开发完整的用户认证系统，支持：
1. ✅ 邮箱注册/登录
2. ✅ Google OAuth 登录（已配置）
3. ⭐ Facebook/Twitter OAuth（UI预留，后续配置）
4. ✅ 用户状态管理
5. ✅ 登录/未登录 UI 状态切换

### 技术栈
- **Supabase Auth**: 认证后端（已配置）
- **shadcn/ui**: UI 组件库（已安装）
- **Next.js 15 App Router**: 框架
- **React Context**: 状态管理

---

## 🏗️ 系统架构设计

### 1. 文件结构规划

```
lib/supabase/
├── auth.ts                          # 认证辅助函数（NEW）
│   ├── signUpWithEmail()
│   ├── signInWithEmail()
│   ├── signInWithOAuth()
│   ├── signOut()
│   └── getCurrentUser()

components/providers/
└── AuthProvider.tsx                 # 认证状态 Provider（NEW）
    ├── useAuth() hook
    ├── user state
    └── loading state

components/features/auth/
├── LoginDialog.tsx                  # 登录对话框主组件（NEW）
├── SignUpDialog.tsx                 # 注册对话框主组件（NEW）
├── AuthTabs.tsx                     # 登录/注册 Tab 切换（NEW）
├── EmailAuthForm.tsx                # 邮箱登录/注册表单（NEW）
├── SocialAuthButtons.tsx            # 社交登录按钮组（NEW）
└── UserMenu.tsx                     # 用户头像菜单（NEW）

components/layout/
└── Header.tsx                       # 更新：集成认证 UI

components/ui/
├── avatar.tsx                       # 头像组件（需安装）
└── (其他已有组件)

app/auth/
└── callback/route.ts                # OAuth 回调处理（NEW）
```

---

## 📐 组件设计详解

### 组件1: AuthProvider (认证状态管理)

**职责**:
- 管理全局用户登录状态
- 监听 Supabase Auth 状态变化
- 提供 useAuth() hook 给所有组件使用

**API**:
```typescript
interface AuthContextType {
  user: User | null;              // 当前用户
  loading: boolean;               // 加载状态
  signOut: () => Promise<void>;   // 登出函数
}

// 使用方式
const { user, loading, signOut } = useAuth();
```

**状态流转**:
```
初始化 → loading: true
  ↓
检查用户 → user: User | null
  ↓
loading: false → 渲染 UI
  ↓
监听变化 → 实时更新 user
```

---

### 组件2: LoginDialog (登录对话框)

**UI 结构**:
```
┌──────────────────────────────────┐
│  🐼 欢迎回来                      │
│                                  │
│  [邮箱登录] [社交登录]  (Tabs)   │
│  ────────────────────             │
│                                  │
│  Tab 1: 邮箱登录                 │
│  ┌──────────────────────┐        │
│  │ 📧 邮箱               │        │
│  └──────────────────────┘        │
│  ┌──────────────────────┐        │
│  │ 🔒 密码               │        │
│  └──────────────────────┘        │
│  [ 忘记密码？]                    │
│  [        登录        ]          │
│                                  │
│  还没有账号？[注册]               │
│                                  │
│  ──── 或使用社交账号 ────         │
│                                  │
│  Tab 2: 社交登录                 │
│  🔵 [使用 Google 继续]           │
│  🔷 [使用 Facebook 继续]         │
│  ⚫ [使用 Twitter 继续]           │
│                                  │
└──────────────────────────────────┘
```

**特性**:
- shadcn/ui Dialog 组件
- Tabs 切换：邮箱 / 社交
- 表单验证（React Hook Form + Zod）
- 错误提示
- 加载状态

---

### 组件3: SignUpDialog (注册对话框)

**UI 结构**:
```
┌──────────────────────────────────┐
│  🐼 加入 Chinglish 社区           │
│                                  │
│  ┌──────────────────────┐        │
│  │ 📧 邮箱               │        │
│  └──────────────────────┘        │
│  ┌──────────────────────┐        │
│  │ 🔒 密码（至少6位）     │        │
│  └──────────────────────┘        │
│  ┌──────────────────────┐        │
│  │ 🔒 确认密码           │        │
│  └──────────────────────┘        │
│                                  │
│  ☑️ 我同意服务条款和隐私政策      │
│                                  │
│  [        注册        ]          │
│                                  │
│  已有账号？[登录]                 │
│                                  │
│  ──── 或使用社交账号 ────         │
│  🔵 [使用 Google 继续]           │
│  🔷 [使用 Facebook 继续]         │
│  ⚫ [使用 Twitter 继续]           │
│                                  │
└──────────────────────────────────┘
```

**验证规则**:
- 邮箱格式验证
- 密码长度 ≥ 6 位
- 密码确认匹配
- 必须同意条款

---

### 组件4: SocialAuthButtons (社交登录按钮组)

**设计**:
```typescript
// 按钮配置
const socialProviders = [
  {
    name: 'Google',
    provider: 'google',
    icon: <GoogleIcon />,
    color: '#4285F4',        // Google 蓝
    enabled: true,           // ✅ 已配置
  },
  {
    name: 'Facebook',
    provider: 'facebook',
    icon: <FacebookIcon />,
    color: '#1877F2',        // Facebook 蓝
    enabled: false,          // ⭐ 预留，后续配置
  },
  {
    name: 'Twitter',
    provider: 'twitter',
    icon: <TwitterIcon />,
    color: '#000000',        // Twitter 黑
    enabled: false,          // ⭐ 预留，后续配置
  },
];
```

**UI 状态**:
- 已启用：正常颜色，可点击
- 未启用：灰色，禁用状态，显示 "即将开放" tooltip

---

### 组件5: UserMenu (用户菜单)

**未登录状态 (Header 右侧)**:
```
┌─────────────────┐
│ [登录] [注册]   │
└─────────────────┘
```

**已登录状态 (Header 右侧)**:
```
┌──────────────────────────┐
│  👤 [用户头像] ▾         │
│                          │
│  下拉菜单：              │
│  ├─ 👤 我的资料          │
│  ├─ 📝 我的投稿          │
│  ├─ ⚙️ 设置              │
│  ├─ ───────             │
│  └─ 🚪 退出登录          │
└──────────────────────────┘
```

**头像显示优先级**:
1. Google OAuth 头像（如果有）
2. 邮箱生成的默认头像（首字母）
3. 熊猫 emoji 🐼

---

## 🔄 用户流程设计

### 流程1: 邮箱注册

```
用户点击 "注册" 按钮
  ↓
打开 SignUpDialog
  ↓
填写邮箱、密码
  ↓
提交表单 → signUpWithEmail()
  ↓
Supabase 创建用户
  ↓
发送验证邮件（如果启用）
  ↓
显示成功提示：
  "注册成功！请查收验证邮件"
  或
  "注册成功！正在登录..."
  ↓
自动登录 → 关闭对话框
  ↓
Header 显示用户菜单
```

### 流程2: 邮箱登录

```
用户点击 "登录" 按钮
  ↓
打开 LoginDialog → 邮箱登录 Tab
  ↓
填写邮箱、密码
  ↓
提交表单 → signInWithEmail()
  ↓
成功：
  ├─ 关闭对话框
  └─ Header 显示用户菜单
失败：
  └─ 显示错误提示
```

### 流程3: Google OAuth 登录

```
用户点击 "使用 Google 继续"
  ↓
调用 signInWithOAuth('google')
  ↓
重定向到 Google 授权页面
  ↓
用户授权
  ↓
重定向回 /auth/callback?code=xxx
  ↓
Supabase 交换 code 获取 session
  ↓
创建/更新用户信息
  ↓
重定向到首页
  ↓
Header 显示用户菜单
```

### 流程4: 登出

```
用户点击 "退出登录"
  ↓
确认对话框（可选）
  ↓
调用 signOut()
  ↓
清除本地 session
  ↓
Header 显示 [登录] [注册] 按钮
  ↓
重定向到首页（可选）
```

---

## 🎨 UI/UX 设计原则

### 1. shadcn/ui 组件使用

**已有组件**:
- ✅ Dialog (对话框)
- ✅ Button (按钮)
- ✅ Input (输入框)
- ✅ Label (标签)
- ✅ Tabs (标签页)
- ✅ Badge (徽章)

**需要安装**:
- ⏳ Avatar (头像)
- ⏳ Dropdown Menu (下拉菜单 - 已有)
- ⏳ Checkbox (复选框)
- ⏳ Separator (分隔线 - 已有)

### 2. 主题一致性

**配色方案**:
- 主色调：黑色 `--primary` (熊猫黑)
- 次要色：白色 `--background`
- Google 按钮：`#4285F4`
- Facebook 按钮：`#1877F2` (灰色禁用状态)
- Twitter 按钮：`#000000` (灰色禁用状态)
- 错误提示：`--error` (红色)
- 成功提示：`--success` (绿色)

**字体和间距**:
- 标题：`text-2xl font-bold`
- 正文：`text-sm`
- 按钮：`h-10 px-4 py-2`
- 间距：`gap-4` / `space-y-4`

### 3. 响应式设计

**Dialog 宽度**:
- 桌面：`max-w-md` (448px)
- 移动：`max-w-[90vw]`

**按钮布局**:
- 桌面：横向排列
- 移动：纵向堆叠

---

## 🔒 安全考虑

### 1. 表单验证

**前端验证** (React Hook Form + Zod):
```typescript
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
});

const signupSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: '请同意服务条款',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
});
```

**后端验证**: Supabase 自动处理

### 2. 密码安全

- ✅ Supabase 使用 bcrypt 哈希
- ✅ 最小长度 6 位（前端验证）
- ⭐ 可选：密码强度提示

### 3. CSRF 防护

- ✅ Supabase OAuth 使用 state 参数
- ✅ HttpOnly Cookie 存储 session
- ✅ Secure Cookie（生产环境 HTTPS）

### 4. XSS 防护

- ✅ React 自动转义
- ✅ 不使用 dangerouslySetInnerHTML
- ✅ Supabase 自动净化输入

---

## 📦 依赖安装清单

### shadcn/ui 组件

```bash
# 需要安装的新组件
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add checkbox

# 已有组件（无需重复安装）
# ✅ dialog
# ✅ button
# ✅ input
# ✅ label
# ✅ tabs
# ✅ dropdown-menu
# ✅ separator
```

### 表单验证

```bash
# React Hook Form (如果还没安装)
npm install react-hook-form @hookform/resolvers zod
```

### 图标（可选）

```bash
# 如果需要社交平台图标
npm install @icons-pack/react-simple-icons
# 或使用 lucide-react (更轻量)
```

---

## 🧪 测试计划

### 测试场景

#### 场景1: 邮箱注册
- [ ] 输入有效邮箱和密码
- [ ] 验证邮箱格式错误提示
- [ ] 验证密码长度错误提示
- [ ] 验证密码不匹配提示
- [ ] 验证必须同意条款
- [ ] 成功注册并自动登录
- [ ] Header 显示用户菜单

#### 场景2: 邮箱登录
- [ ] 输入正确的邮箱和密码
- [ ] 成功登录
- [ ] 输入错误的密码，显示错误提示
- [ ] 输入不存在的邮箱，显示错误提示

#### 场景3: Google OAuth 登录
- [ ] 点击 Google 登录按钮
- [ ] 重定向到 Google 授权页面
- [ ] 授权成功后回调
- [ ] 自动创建用户资料
- [ ] 显示 Google 头像

#### 场景4: 用户状态持久化
- [ ] 登录后刷新页面
- [ ] 用户状态保持登录
- [ ] Token 自动刷新
- [ ] 退出登录清除状态

#### 场景5: UI 状态切换
- [ ] 未登录显示 [登录] [注册]
- [ ] 已登录显示用户头像
- [ ] 用户菜单正常工作
- [ ] 退出登录后恢复未登录状态

---

## ⏱️ 开发时间估算

| 任务 | 时间 | 依赖 |
|------|------|------|
| 1. 安装依赖和组件 | 10分钟 | - |
| 2. 创建 auth.ts 辅助函数 | 20分钟 | - |
| 3. 创建 AuthProvider | 30分钟 | 2 |
| 4. 创建 SocialAuthButtons | 20分钟 | 2 |
| 5. 创建 EmailAuthForm | 30分钟 | 2 |
| 6. 创建 LoginDialog | 20分钟 | 4, 5 |
| 7. 创建 SignUpDialog | 20分钟 | 4, 5 |
| 8. 创建 UserMenu | 30分钟 | 3 |
| 9. 更新 Header | 20分钟 | 6, 7, 8 |
| 10. 创建 OAuth 回调路由 | 15分钟 | 3 |
| 11. 集成到 app/layout.tsx | 10分钟 | 3 |
| 12. 测试所有流程 | 30分钟 | 全部 |
| **总计** | **4小时15分钟** | - |

---

## 🚀 实施顺序

### 阶段1: 基础设施（1小时）
1. ✅ 安装 shadcn/ui 组件
2. ✅ 创建 lib/supabase/auth.ts
3. ✅ 创建 AuthProvider
4. ✅ 集成到 layout.tsx

### 阶段2: UI 组件（1.5小时）
5. ✅ SocialAuthButtons
6. ✅ EmailAuthForm
7. ✅ LoginDialog
8. ✅ SignUpDialog

### 阶段3: Header 集成（1小时）
9. ✅ UserMenu
10. ✅ 更新 Header
11. ✅ OAuth 回调处理

### 阶段4: 测试和优化（45分钟）
12. ✅ 全流程测试
13. ✅ 错误处理优化
14. ✅ UI 细节调整

---

## 🎯 成功标准

### 必须完成（MVP）

- [x] Google OAuth 已配置
- [ ] 用户可以邮箱注册
- [ ] 用户可以邮箱登录
- [ ] 用户可以 Google 登录
- [ ] Header 正确显示登录状态
- [ ] 用户菜单工作正常
- [ ] 退出登录功能正常
- [ ] 登录状态持久化

### 可选功能

- [ ] 忘记密码功能
- [ ] 邮箱验证提醒
- [ ] 用户资料编辑页面
- [ ] Facebook OAuth（UI已预留）
- [ ] Twitter OAuth（UI已预留）

---

## 📝 注意事项

### 1. 邮箱验证配置

**当前 Supabase 设置**:
- ✅ Confirm email: 已启用

**开发环境建议**:
- 选项A：临时关闭验证（快速测试）
- 选项B：使用真实邮箱测试

**生产环境**:
- 必须启用邮箱验证
- 配置邮件发送服务

### 2. OAuth 回调 URL

**开发环境**:
```
http://localhost:3001/auth/callback
```

**生产环境**:
```
https://yourdomain.com/auth/callback
```

需要在 Google Cloud Console 中同时配置两个 URL。

### 3. Facebook/Twitter 按钮

- 现在就添加 UI 按钮
- 状态设为 **禁用**
- 显示 "即将开放" tooltip
- 后续配置 OAuth 后只需修改 `enabled: true`

---

## 🔄 后续扩展计划

### Phase 2: 用户资料系统
- 用户资料页面
- 头像上传
- 昵称修改
- 个人简介

### Phase 3: 用户投稿管理
- 我的投稿列表
- 投稿状态查询
- 编辑/删除投稿

### Phase 4: 社交功能
- 词条收藏
- 词条点赞
- 评论功能

---

## ✅ 准备开始实施

**确认清单**:
- ✅ Google OAuth 已配置
- ✅ Supabase Auth 已启用
- ✅ shadcn/ui 已安装
- ✅ 开发计划已制定
- ✅ 文件结构已规划

**下一步**:
等待用户确认后立即开始编码！

---

**预计总开发时间**: 4-5小时
**预计完成时间**: 今天内完成
