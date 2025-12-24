# Profiles 表认证流程测试计划

## 测试目的

验证 Chinglish WB 项目中的用户认证流程是否能正确创建和同步 `profiles` 表记录，包括：
- 邮箱注册/登录
- Google OAuth 登录
- 用户信息提取（full_name, avatar_url）
- Row Level Security (RLS) 权限控制

## 前置准备

### 1. 数据库准备
- [ ] 确认 Supabase 项目已创建并运行
- [ ] 确认 `profiles` 表已创建（参考 schema 文件）
- [ ] 确认触发器 `on_auth_user_created` 已创建
- [ ] 确认 RLS 策略已启用

**验证命令：**
```sql
-- 在 Supabase SQL Editor 中运行
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';
```
**预期结果：** `rowsecurity` 为 `true`

### 2. 环境变量配置
- [ ] 确认 `.env.local` 中包含正确的 Supabase 凭据
- [ ] 确认 Google OAuth 已在 Supabase Dashboard 中配置

**检查命令：**
```bash
# 在项目根目录运行
cat .env.local | grep SUPABASE
```

### 3. 开发服务器启动
- [ ] 启动 Next.js 开发服务器
```bash
npm run dev
```
- [ ] 访问 http://localhost:3000，确认页面正常加载

---

## 测试场景

### 场景 1: 邮箱注册新用户

#### 测试步骤
1. [ ] 打开浏览器，访问 http://localhost:3000/auth
2. [ ] 点击"注册"选项卡
3. [ ] 填写测试邮箱（例如：`test-user-1@example.com`）
4. [ ] 填写密码（至少 6 位）
5. [ ] 点击"注册"按钮
6. [ ] 等待 Supabase 发送确认邮件（注意：开发环境可能需要在 Supabase Dashboard 查看确认链接）

#### 预期结果
- [ ] 页面显示"请检查邮箱完成注册"提示
- [ ] Supabase Dashboard → Authentication → Users 中出现新用户
- [ ] 新用户的 `email_confirmed` 状态为 `false`（确认前）

#### 数据库验证
```sql
-- 在 Supabase SQL Editor 中运行
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at AS auth_created_at,
  p.id AS profile_id,
  p.email AS profile_email,
  p.full_name,
  p.avatar_url,
  p.created_at AS profile_created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'test-user-1@example.com';
```

**预期结果：**
- [ ] `profile_id` 不为 NULL（即使邮箱未确认，profiles 记录也应该创建）
- [ ] `profile_email` 与 `au.email` 匹配
- [ ] `full_name` 为 NULL 或从邮箱提取的默认值（例如：`test-user-1`）
- [ ] `avatar_url` 为 NULL
- [ ] `profile_created_at` 与 `auth_created_at` 相差不超过 5 秒

**通过标准：** 所有字段符合预期，profiles 记录自动创建

---

### 场景 2: 邮箱确认后登录

#### 测试步骤
1. [ ] 在 Supabase Dashboard → Authentication → Users 中找到上一步创建的用户
2. [ ] 点击用户邮箱，手动标记为"已确认"（或点击邮件中的确认链接）
3. [ ] 返回 http://localhost:3000/auth
4. [ ] 使用相同的邮箱和密码登录
5. [ ] 登录成功后，应跳转到首页

#### 预期结果
- [ ] 登录成功，页面跳转到 http://localhost:3000
- [ ] 页面右上角显示用户邮箱或头像
- [ ] 浏览器控制台无错误信息

#### 数据库验证
```sql
-- 验证 profiles 记录仍然存在且未被重复创建
SELECT COUNT(*) AS profile_count
FROM public.profiles
WHERE email = 'test-user-1@example.com';
```

**预期结果：**
- [ ] `profile_count` 应该为 `1`（不会重复创建）

**通过标准：** 登录流程正常，profiles 记录唯一

---

### 场景 3: Google OAuth 登录

#### 测试步骤
1. [ ] 打开浏览器隐私模式（避免缓存干扰）
2. [ ] 访问 http://localhost:3000/auth
3. [ ] 点击"使用 Google 登录"按钮
4. [ ] 在 Google 登录页面选择测试账号（例如：`your-test-account@gmail.com`）
5. [ ] 授权 Chinglish WB 访问基本信息
6. [ ] 等待回调并跳转到首页

#### 预期结果
- [ ] 登录成功，跳转到 http://localhost:3000
- [ ] 页面右上角显示 Google 账号的头像和姓名
- [ ] 浏览器控制台无错误信息

#### 数据库验证
```sql
-- 查看 Google OAuth 用户的详细信息
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'provider' AS provider,
  au.raw_user_meta_data->>'full_name' AS metadata_full_name,
  au.raw_user_meta_data->>'avatar_url' AS metadata_avatar_url,
  p.id AS profile_id,
  p.email AS profile_email,
  p.full_name AS profile_full_name,
  p.avatar_url AS profile_avatar_url
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'your-test-account@gmail.com';
```

**预期结果：**
- [ ] `provider` 为 `google`
- [ ] `metadata_full_name` 包含 Google 账号的真实姓名
- [ ] `metadata_avatar_url` 包含 Google 头像 URL
- [ ] `profile_id` 不为 NULL（profiles 记录自动创建）
- [ ] `profile_full_name` 与 `metadata_full_name` 一致
- [ ] `profile_avatar_url` 与 `metadata_avatar_url` 一致

**通过标准：** profiles 记录正确提取了 Google 用户信息

---

### 场景 4: 用户更新自己的 Profile（RLS 权限测试）

#### 测试步骤
1. [ ] 使用邮箱或 Google OAuth 登录（任意已认证用户）
2. [ ] 打开浏览器开发者工具 → Console
3. [ ] 运行以下 JavaScript 代码测试更新权限：

```javascript
// 获取当前用户 ID
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user ID:', user.id);

// 尝试更新自己的 full_name
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Updated Test Name' })
  .eq('id', user.id)
  .select();

console.log('Update result:', { data, error });
```

#### 预期结果
- [ ] `error` 为 `null`
- [ ] `data` 返回更新后的记录
- [ ] 控制台无权限错误

#### 数据库验证
```sql
-- 验证更新是否成功
SELECT id, email, full_name, updated_at
FROM public.profiles
WHERE id = '<user-id-from-console>';
```

**预期结果：**
- [ ] `full_name` 已更新为 `'Updated Test Name'`
- [ ] `updated_at` 时间戳已更新

**通过标准：** 用户可以成功更新自己的 profile

---

### 场景 5: 用户无法更新他人 Profile（RLS 安全测试）

#### 测试步骤
1. [ ] 继续使用上一场景的已登录用户
2. [ ] 在数据库中找到另一个用户的 ID（或创建第二个测试用户）
3. [ ] 在浏览器控制台运行以下代码：

```javascript
// 获取当前用户 ID
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user ID:', user.id);

// 尝试更新其他用户的 profile（使用不同的 user ID）
const otherUserId = '<other-user-id>'; // 替换为其他用户的真实 ID
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Hacked Name' })
  .eq('id', otherUserId)
  .select();

console.log('Unauthorized update result:', { data, error });
```

#### 预期结果
- [ ] `error` 不为 `null`（应该有权限错误）
- [ ] `error.message` 包含类似 "row-level security policy" 或 "permission denied" 的内容
- [ ] `data` 为 `null` 或空数组

#### 数据库验证
```sql
-- 验证目标用户的 full_name 未被修改
SELECT id, email, full_name, updated_at
FROM public.profiles
WHERE id = '<other-user-id>';
```

**预期结果：**
- [ ] `full_name` 保持原值，未被修改为 `'Hacked Name'`

**通过标准：** RLS 策略正确阻止了未授权的更新操作

---

### 场景 6: 未登录用户可以查看公开 Profiles（RLS 可读性测试）

#### 测试步骤
1. [ ] 登出当前用户（或使用隐私模式打开新标签页）
2. [ ] 在浏览器控制台运行以下代码：

```javascript
// 尝试读取 profiles 表（未登录状态）
const { data, error } = await supabase
  .from('profiles')
  .select('id, email, full_name, avatar_url')
  .limit(5);

console.log('Public read result:', { data, error });
```

#### 预期结果
- [ ] `error` 为 `null`
- [ ] `data` 返回公开的 profiles 记录数组
- [ ] 敏感信息（如邮箱）可能被 RLS 策略过滤（取决于策略配置）

**通过标准：** 未登录用户可以读取公开的 profiles 信息

---

### 场景 7: 验证已有用户的数据回填

#### 测试步骤
1. [ ] 打开 Supabase SQL Editor
2. [ ] 运行以下查询，找出所有缺失 profiles 的用户：

```sql
SELECT
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

3. [ ] 如果有缺失记录，运行回填脚本：

```sql
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

4. [ ] 再次运行第一个查询，确认缺失记录已回填

#### 预期结果
- [ ] 回填后，所有 auth.users 都有对应的 profiles 记录
- [ ] `full_name` 正确提取（Google 用户显示真实姓名，邮箱用户显示邮箱前缀）
- [ ] `avatar_url` 正确提取（Google 用户有头像 URL）

#### 最终验证
```sql
-- 统计数据一致性
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.profiles) AS profiles_count,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) AS difference;
```

**预期结果：**
- [ ] `difference` 为 `0`（完全一致）

**通过标准：** 所有历史用户数据已成功回填

---

## 完整性验证脚本

### 运行自动化验证脚本
```bash
# 在项目根目录运行
psql -h <supabase-host> -U postgres -d postgres -f .project-docs/database/tests/verify_profiles_sync.sql
```

或者在 Supabase SQL Editor 中复制粘贴 `verify_profiles_sync.sql` 的内容并执行。

### 查看测试报告
脚本会生成一个临时表 `profiles_sync_report`，包含所有测试结果：

```sql
SELECT * FROM profiles_sync_report ORDER BY test_name;
```

**预期输出示例：**
```
test_name          | status | details
-------------------+--------+------------------------------------------
Data Consistency   | PASS   | auth.users: 5, profiles: 5
Missing Profiles   | PASS   | Found 0 users without profiles
RLS Enabled        | PASS   | Row Level Security is enabled
Table Exists       | PASS   | profiles table found
Trigger Exists     | PASS   | on_auth_user_created trigger found
```

---

## 测试通过标准总结

### 必须全部通过的检查项
- [ ] profiles 表存在且结构正确
- [ ] 触发器 `on_auth_user_created` 存在且启用
- [ ] RLS 策略已启用
- [ ] 邮箱注册能自动创建 profiles 记录
- [ ] Google OAuth 登录能自动创建 profiles 记录
- [ ] Google 用户的 full_name 和 avatar_url 正确提取
- [ ] auth.users 与 profiles 数据完全同步（count 一致）
- [ ] 用户可以更新自己的 profile
- [ ] 用户无法更新他人的 profile
- [ ] 未登录用户可以读取公开 profiles

### 可选的高级检查
- [ ] profiles 创建时间与 auth.users 创建时间相差不超过 5 秒
- [ ] 不存在孤立的 profiles 记录（没有对应的 auth.users）
- [ ] email 字段在两个表中完全匹配
- [ ] 所有 OAuth 用户的 metadata 正确同步到 profiles

---

## 问题排查指南

### 问题 1: profiles 记录未自动创建
**症状：** 用户注册/登录后，profiles 表中没有对应记录

**排查步骤：**
1. 检查触发器是否存在：
   ```sql
   SELECT * FROM information_schema.triggers WHERE event_object_table = 'users';
   ```
2. 检查触发器函数是否有错误：
   ```sql
   SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'handle_new_user';
   ```
3. 查看 Supabase Logs（Dashboard → Logs → Postgres Logs）

**解决方案：** 重新创建触发器和函数（参考 schema.sql）

---

### 问题 2: Google OAuth 用户信息缺失
**症状：** Google 登录后，full_name 或 avatar_url 为空

**排查步骤：**
1. 检查 Google OAuth 配置（Supabase Dashboard → Authentication → Providers）
2. 验证 Google OAuth Scopes 是否包含 `profile` 和 `email`
3. 查看 raw_user_meta_data：
   ```sql
   SELECT raw_user_meta_data FROM auth.users WHERE email = '<google-user-email>';
   ```

**解决方案：** 确保 Google OAuth 配置正确，重新登录测试

---

### 问题 3: RLS 权限错误
**症状：** 用户无法更新自己的 profile

**排查步骤：**
1. 检查 RLS 策略：
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. 验证当前用户的 auth.uid()：
   ```sql
   SELECT auth.uid();
   ```

**解决方案：** 重新创建 RLS 策略（参考 schema.sql）

---

## 测试完成清单

- [ ] 所有 7 个测试场景全部通过
- [ ] 自动化验证脚本输出全部 PASS
- [ ] 无遗留的缺失 profiles 记录
- [ ] RLS 权限控制正常工作
- [ ] 测试数据已清理（可选）

**测试完成日期：** __________

**测试人员签名：** __________

---

## 附录：快速测试命令集合

```bash
# 启动开发服务器
npm run dev

# 查看环境变量
cat .env.local | grep SUPABASE

# 运行 SQL 验证脚本
# 方法 1: 在 Supabase SQL Editor 中复制粘贴 verify_profiles_sync.sql
# 方法 2: 使用 psql（需要配置连接字符串）
```

```sql
-- 快速检查数据一致性
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_count,
  (SELECT COUNT(*) FROM public.profiles) AS profile_count;

-- 快速查看最近用户
SELECT
  au.email,
  au.created_at,
  p.full_name,
  p.avatar_url
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 5;
```
