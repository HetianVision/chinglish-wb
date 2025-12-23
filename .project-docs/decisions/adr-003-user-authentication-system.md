# ADR-003: 用户认证系统设计方案

**状态**: 提案中
**日期**: 2024-12-23
**决策者**: 用户 + AI Assistant

---

## 📋 需求分析

### 用户明确需求

1. **邮箱登录/注册**
   - 用户可以使用邮箱 + 密码注册
   - 用户可以使用邮箱 + 密码登录

2. **第三方社交登录（OAuth）**
   - Google 账号登录
   - Facebook 账号登录
   - Twitter/X 账号登录

3. **智能登录提示**
   - 检测用户是否在 Chrome 中已登录 Google
   - 如果已登录，提示用户使用 Google 一键登录

4. **优先级**
   - 先完成用户登录功能
   - 管理员审核系统延后

---

## 🎯 技术方案选型

### 方案对比

#### 方案A：Supabase Auth（推荐 ⭐⭐⭐⭐⭐）

**优势**：
- ✅ **已有 Supabase**：我们已经在使用 Supabase 数据库
- ✅ **内置完整认证系统**：Email/Password + OAuth 开箱即用
- ✅ **支持所有需求的 OAuth 提供商**：
  - Google（原生支持）
  - Facebook（原生支持）
  - Twitter/X（原生支持）
- ✅ **自动管理用户表**：`auth.users` 表自动创建
- ✅ **JWT Token 管理**：自动处理 session 和 token 刷新
- ✅ **Row Level Security (RLS) 集成**：可以基于用户 ID 设置数据权限
- ✅ **免费额度充足**：50,000 月活用户免费
- ✅ **Next.js SSR 支持**：`@supabase/ssr` 已安装
- ✅ **安全性高**：Email 验证、密码重置、Magic Link 等功能内置

**劣势**：
- ⚠️ 需要配置 OAuth 应用（Google/Facebook/Twitter）
- ⚠️ 邮箱验证需要配置邮件服务（可选，开发环境可关闭）

**开发成本**：低（2-3小时）

---

#### 方案B：NextAuth.js

**优势**：
- ✅ Next.js 官方推荐
- ✅ 支持多种 OAuth 提供商
- ✅ 灵活的自定义能力

**劣势**：
- ❌ 需要额外配置数据库适配器
- ❌ 需要自己管理用户表结构
- ❌ 与现有 Supabase 集成复杂
- ❌ 需要额外的依赖和配置

**开发成本**：中等（4-5小时）

---

#### 方案C：自建认证系统

**优势**：
- ✅ 完全可控

**劣势**：
- ❌ 安全风险高（密码加密、Token 管理、CSRF 防护等）
- ❌ 开发成本巨大（至少10小时+）
- ❌ 需要处理大量边界情况
- ❌ 不推荐（除非有特殊需求）

**开发成本**：高（10小时+）

---

## ✅ 推荐方案：Supabase Auth

**理由**：
1. 我们已经在使用 Supabase，集成成本最低
2. 支持所有需求的功能（Email + Google/Facebook/Twitter）
3. 安全性高，久经考验
4. 开发速度快，2-3小时即可完成
5. 免费额度充足，适合 MVP

---

## 🏗️ 详细实施方案

### 阶段1：Supabase Auth 配置（30分钟）

#### 1.1 启用 Email 认证

在 Supabase Dashboard 中配置：
1. 访问：Authentication → Providers
2. 启用 **Email** 提供商
3. 配置选项：
   - ✅ Enable Email provider
   - ⚠️ **Confirm email**：开发环境关闭，生产环境开启
   - ✅ **Secure email change**：开启
   - ✅ **Enable sign-ups**：允许用户注册

#### 1.2 配置 Google OAuth

1. 创建 Google OAuth 应用：
   - 访问：https://console.cloud.google.com/apis/credentials
   - 创建 OAuth 2.0 客户端 ID
   - 应用类型：Web 应用
   - 授权重定向 URI：
     ```
     https://bdndxbcmdvsgmapmgalh.supabase.co/auth/v1/callback
     ```
   - 获取：Client ID 和 Client Secret

2. 在 Supabase 中配置：
   - Authentication → Providers → Google
   - 输入 Client ID 和 Client Secret
   - 启用 Google 登录

#### 1.3 配置 Facebook OAuth

1. 创建 Facebook 应用：
   - 访问：https://developers.facebook.com/apps/
   - 创建应用 → 消费者
   - 产品：添加 Facebook 登录
   - 设置 → 基本 → 获取应用 ID 和密钥
   - Facebook 登录 → 设置 → 有效 OAuth 重定向 URI：
     ```
     https://bdndxbcmdvsgmapmgalh.supabase.co/auth/v1/callback
     ```

2. 在 Supabase 中配置：
   - Authentication → Providers → Facebook
   - 输入 App ID 和 App Secret

#### 1.4 配置 Twitter/X OAuth

1. 创建 Twitter 应用：
   - 访问：https://developer.twitter.com/en/portal/dashboard
   - 创建项目和应用
   - 启用 OAuth 2.0
   - 回调 URL：
     ```
     https://bdndxbcmdvsgmapmgalh.supabase.co/auth/v1/callback
     ```
   - 获取 Client ID 和 Client Secret

2. 在 Supabase 中配置：
   - Authentication → Providers → Twitter
   - 输入 Client ID 和 Client Secret

---

### 阶段2：前端代码实现（2小时）

#### 2.1 认证相关组件结构

```
components/
├── features/
│   └── auth/
│       ├── LoginModal.tsx           # 登录弹窗
│       ├── SignUpModal.tsx          # 注册弹窗
│       ├── SocialLoginButtons.tsx   # 社交登录按钮组
│       ├── EmailLoginForm.tsx       # 邮箱登录表单
│       ├── GoogleSmartLogin.tsx     # Google 智能登录提示
│       └── UserMenu.tsx             # 用户菜单（头像下拉）
│
├── providers/
│   └── AuthProvider.tsx             # 认证状态 Provider
│
└── ui/
    ├── dialog.tsx                   # 对话框组件（shadcn/ui）
    └── avatar.tsx                   # 头像组件（shadcn/ui）
```

#### 2.2 核心功能实现

**功能1：邮箱注册/登录**

```typescript
// lib/supabase/auth.ts
import { createClient } from '@/lib/supabase/client';

// 邮箱注册
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signUp({ email, password });
}

// 邮箱登录
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

// 登出
export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

// 获取当前用户
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

**功能2：OAuth 社交登录**

```typescript
// Google 登录
export async function signInWithGoogle() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
}

// Facebook 登录
export async function signInWithFacebook() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  });
}

// Twitter 登录
export async function signInWithTwitter() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  });
}
```

**功能3：Google 智能登录检测**

```typescript
// 检测用户是否在 Chrome 中登录了 Google
export async function checkGoogleSignInStatus(): Promise<boolean> {
  // 方案1：使用 Google Identity Services (推荐)
  // 需要加载 Google GSI 脚本

  // 方案2：使用 One Tap 自动提示
  // Google 会自动检测并提示登录

  return false; // 需要实现检测逻辑
}
```

**功能4：认证状态管理**

```typescript
// components/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### 2.3 UI 组件设计

**登录弹窗设计**：

```typescript
// components/features/auth/LoginModal.tsx
- Tab 切换：邮箱登录 / 社交登录
- 邮箱登录表单：
  - Email 输入框
  - Password 输入框
  - "忘记密码" 链接
  - "登录" 按钮
  - "还没有账号？注册" 链接

- 社交登录按钮组：
  - 🔵 使用 Google 继续
  - 🔷 使用 Facebook 继续
  - ⚫ 使用 Twitter 继续
```

**Google 智能登录提示**：

```typescript
// components/features/auth/GoogleSmartLogin.tsx
// 在页面顶部显示一个温馨提示条：
// "✨ 检测到您已登录 Google，点击一键登录"
// [使用 Google 登录] [关闭]
```

**用户菜单**：

```typescript
// components/features/auth/UserMenu.tsx
// Header 右侧显示：
// - 未登录：[登录] [注册] 按钮
// - 已登录：用户头像 → 下拉菜单
//   - 我的投稿
//   - 个人设置
//   - 退出登录
```

---

### 阶段3：OAuth 回调处理（30分钟）

#### 3.1 创建回调路由

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 登录失败，重定向到错误页
  return NextResponse.redirect(`${origin}/auth/error`);
}
```

#### 3.2 错误处理页面

```typescript
// app/auth/error/page.tsx
export default function AuthErrorPage() {
  return (
    <div className="text-center py-12">
      <h1>登录失败</h1>
      <p>请重试或联系支持</p>
    </div>
  );
}
```

---

### 阶段4：Google One Tap 智能登录（1小时）

#### 4.1 集成 Google Identity Services

**加载 GSI 脚本**：

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Google Identity Services */}
        <script src="https://accounts.google.com/gsi/client" async></script>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

**实现 One Tap 组件**：

```typescript
// components/features/auth/GoogleOneTap.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

export function GoogleOneTap() {
  const { user } = useAuth();

  useEffect(() => {
    // 如果用户已登录，不显示 One Tap
    if (user) return;

    // 初始化 Google One Tap
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: true, // 自动选择已登录的 Google 账号
        cancel_on_tap_outside: false,
      });

      // 显示 One Tap UI
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('One Tap not displayed:', notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
          console.log('One Tap skipped:', notification.getSkippedReason());
        }
      });
    }
  }, [user]);

  async function handleCredentialResponse(response: any) {
    // 使用 Google ID Token 登录 Supabase
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });

    if (error) {
      console.error('Google One Tap login failed:', error);
    } else {
      console.log('Google One Tap login successful:', data);
      window.location.reload(); // 刷新页面
    }
  }

  return null; // 不渲染任何 UI，Google One Tap 会自动显示
}
```

**在布局中使用**：

```typescript
// app/layout.tsx
import { GoogleOneTap } from '@/components/features/auth/GoogleOneTap';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <GoogleOneTap /> {/* 自动显示 Google One Tap */}
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### 阶段5：用户数据关联（30分钟）

#### 5.1 扩展 users 表

```sql
-- 更新 users 表结构
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- 自动创建用户资料的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 5.2 更新 RLS 策略

```sql
-- terms 表：登录用户可以创建
CREATE POLICY "Authenticated users can create terms"
  ON terms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- submissions 表：登录用户可以查看自己的投稿
CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (submitter_email = auth.email());

-- submissions 表：登录用户可以创建投稿
CREATE POLICY "Authenticated users can submit"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
```

---

## 📊 功能对比表

| 功能 | 邮箱登录 | Google | Facebook | Twitter | One Tap |
|------|---------|--------|----------|---------|---------|
| 开发难度 | 简单 | 中等 | 中等 | 中等 | 中等 |
| 开发时间 | 30分钟 | 30分钟 | 30分钟 | 30分钟 | 1小时 |
| 用户体验 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 转化率 | 中 | 高 | 高 | 中 | 极高 |
| 优先级 | P0（必须） | P0（必须） | P1（推荐） | P2（可选） | P1（推荐） |

---

## 🎯 实施顺序建议

### 阶段1：核心认证（必须，2小时）
1. ✅ Supabase Email 认证配置
2. ✅ 邮箱登录/注册 UI
3. ✅ Google OAuth 配置
4. ✅ Google 登录按钮
5. ✅ OAuth 回调处理
6. ✅ 认证状态管理（AuthProvider）
7. ✅ 用户菜单（Header 集成）

### 阶段2：智能登录（推荐，1小时）
8. ✅ Google One Tap 集成
9. ✅ 自动检测 Google 登录状态
10. ✅ 智能提示 UI

### 阶段3：扩展社交登录（可选，1小时）
11. ⭐ Facebook OAuth 配置
12. ⭐ Twitter OAuth 配置
13. ⭐ 社交登录按钮 UI

### 阶段4：用户数据（必须，30分钟）
14. ✅ users 表扩展
15. ✅ 自动创建用户资料触发器
16. ✅ RLS 策略更新

---

## 🔒 安全考虑

### 1. 密码安全
- ✅ Supabase 自动处理密码哈希（bcrypt）
- ✅ 密码强度验证（最少6位）
- ✅ 可选：添加密码复杂度要求

### 2. OAuth 安全
- ✅ 使用官方 OAuth 流程（Authorization Code Flow）
- ✅ State 参数防止 CSRF 攻击
- ✅ 重定向 URL 白名单验证

### 3. Session 管理
- ✅ JWT Token 自动刷新
- ✅ HttpOnly Cookie 存储（防止 XSS）
- ✅ Secure Cookie（生产环境 HTTPS）

### 4. RLS 数据权限
- ✅ 基于 auth.uid() 的行级权限
- ✅ 用户只能访问自己的数据

---

## 📝 环境变量配置

需要在 `.env.local` 中添加：

```bash
# Google OAuth (用于 One Tap)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Supabase 已有配置（无需修改）
NEXT_PUBLIC_SUPABASE_URL=https://bdndxbcmdvsgmapmgalh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🧪 测试计划

### 测试场景

1. **邮箱注册**
   - ✅ 输入有效邮箱和密码
   - ✅ 验证邮箱格式
   - ✅ 密码强度检查
   - ✅ 注册成功后自动登录

2. **邮箱登录**
   - ✅ 输入正确的邮箱和密码
   - ✅ 错误的邮箱或密码提示
   - ✅ 登录成功后跳转

3. **Google 登录**
   - ✅ 点击 Google 登录按钮
   - ✅ Google OAuth 授权流程
   - ✅ 授权成功后回调
   - ✅ 用户信息自动创建

4. **Google One Tap**
   - ✅ 页面加载时自动显示 One Tap
   - ✅ 已登录 Google 时自动提示
   - ✅ 一键登录成功

5. **用户状态**
   - ✅ 登录后 Header 显示用户头像
   - ✅ 用户菜单正常工作
   - ✅ 退出登录清除状态

6. **数据权限**
   - ✅ 登录用户可以查看自己的投稿
   - ✅ 未登录用户无法访问受保护资源

---

## 📦 依赖清单

### 新增 NPM 包

```bash
# Google Identity Services (通过 CDN 加载，无需 npm)
# shadcn/ui 新增组件
npx shadcn-ui@latest add dialog  # 已安装
npx shadcn-ui@latest add avatar  # 需要安装
npx shadcn-ui@latest add dropdown-menu  # 已安装
```

### 已有依赖（无需安装）
- ✅ @supabase/supabase-js
- ✅ @supabase/ssr
- ✅ shadcn/ui 组件

---

## 🎨 UI 设计要点

### 登录弹窗
- 使用 shadcn/ui Dialog 组件
- 黑白熊猫主题配色
- 简洁的表单设计
- 社交登录按钮使用品牌色：
  - Google：#4285F4（蓝色）
  - Facebook：#1877F2（蓝色）
  - Twitter：#000000（黑色）

### Google One Tap
- 使用 Google 默认样式
- 定位：右上角（不遮挡主要内容）
- 自动消失时间：5秒

### 用户菜单
- 圆形头像
- 下拉菜单使用 shadcn/ui DropdownMenu
- 包含：我的投稿、设置、退出

---

## 🚀 预计开发时间

| 阶段 | 内容 | 时间 |
|------|------|------|
| 1 | Supabase Auth 配置 | 30分钟 |
| 2 | 邮箱登录/注册功能 | 1小时 |
| 3 | Google OAuth 登录 | 30分钟 |
| 4 | Google One Tap 集成 | 1小时 |
| 5 | 用户状态管理 + UI | 1小时 |
| 6 | 用户数据关联 + RLS | 30分钟 |
| **总计** | **核心功能完整** | **4.5小时** |

**可选扩展**（Facebook + Twitter）：+1小时

---

## ⚠️ 注意事项

### 开发环境 vs 生产环境

**开发环境**：
- 可以关闭邮箱验证（快速测试）
- Google OAuth 回调 URL：`http://localhost:3001/auth/callback`
- 测试账号即可

**生产环境**：
- ✅ 必须启用邮箱验证
- ✅ Google OAuth 回调 URL：`https://yourdomain.com/auth/callback`
- ✅ 配置真实的 OAuth 应用
- ✅ 启用 HTTPS
- ✅ 配置邮件服务（Supabase 内置或 Resend）

---

## 📊 对现有功能的影响

### 需要修改的功能

1. **投稿系统**
   - ✅ 已登录用户：自动填充邮箱和昵称
   - ✅ 未登录用户：提示登录或继续匿名投稿

2. **Header 组件**
   - ✅ 未登录：显示 [登录] [注册] 按钮
   - ✅ 已登录：显示用户头像和菜单

3. **词条详情页**
   - 可选：添加"收藏"功能（需要登录）
   - 可选：添加"点赞"功能（需要登录）

4. **RLS 策略**
   - ✅ submissions 表：登录用户可查看自己的投稿
   - ✅ terms 表：保持当前策略（所有人可读）

---

## 🎯 成功标准

### 最小可用产品（MVP）

- ✅ 用户可以使用邮箱注册/登录
- ✅ 用户可以使用 Google 账号一键登录
- ✅ 已登录 Google 的用户看到 One Tap 提示
- ✅ 用户登录状态在整个应用中持久化
- ✅ Header 正确显示登录/未登录状态
- ✅ 用户可以安全退出登录

### 完整版本

- ✅ 支持 Facebook 和 Twitter 登录
- ✅ 忘记密码功能
- ✅ 用户资料编辑页面
- ✅ 我的投稿列表页面

---

## 📋 总结

### 推荐方案：Supabase Auth + Google One Tap

**核心优势**：
1. 集成成本低（已有 Supabase）
2. 开发速度快（4.5小时完成核心功能）
3. 用户体验好（Google One Tap 转化率极高）
4. 安全性高（Supabase 久经考验）
5. 免费额度充足（50,000 MAU）

**实施顺序**：
1. 先做邮箱 + Google OAuth（必须，2.5小时）
2. 再做 Google One Tap（推荐，1小时）
3. 最后做 Facebook/Twitter（可选，1小时）

**风险评估**：
- 低风险：技术成熟，文档完善
- 唯一挑战：需要申请并配置 OAuth 应用（约30分钟）

---

## 🤔 需要您确认的问题

在开始开发前，请确认以下问题：

### 1. OAuth 提供商优先级
- **必须支持**：邮箱 + Google（核心功能）
- **推荐支持**：Google One Tap（提升转化率）
- **可选支持**：Facebook + Twitter

**问题1**：是否一次性开发所有 OAuth 提供商？还是先做 Google，其他延后？

### 2. 邮箱验证
- **开发环境**：建议关闭（快速测试）
- **生产环境**：建议开启（防止垃圾注册）

**问题2**：开发环境是否需要邮箱验证？

### 3. 用户资料
- **最小版本**：自动创建基本资料（邮箱、昵称、头像）
- **完整版本**：用户可以编辑资料页面

**问题3**：是否现在就开发用户资料编辑页面？还是延后？

### 4. 现有功能调整
- **投稿系统**：是否要求用户必须登录才能投稿？
- **词条收藏**：是否要增加收藏功能（需要登录）？

**问题4**：投稿是否要求必须登录？

### 5. Google One Tap 配置
- 需要 Google Cloud Console 账号
- 需要创建 OAuth 2.0 客户端
- 需要配置授权域名

**问题5**：您是否有 Google Cloud 账号？如果没有，需要先创建。

---

## 🚦 等待您的决策

请告诉我：

1. **是否批准此方案**？（Supabase Auth + Google One Tap）
2. **优先级确认**：
   - 必须：邮箱 + Google
   - 推荐：Google One Tap
   - 可选：Facebook + Twitter
3. **开发顺序**：一次性开发全部？还是分阶段？
4. **上述5个问题的答案**

确认后我立即开始开发！🚀
