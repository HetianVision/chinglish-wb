# Supabase 集成指南

本文档说明如何将 Chinglish 黑白语言站连接到 Supabase 数据库。

## 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击「New Project」创建新项目
4. 填写项目信息：
   - **Name**: chinglish-wb（或任意名称）
   - **Database Password**: 设置一个强密码（请妥善保存）
   - **Region**: 选择离您最近的地区
5. 等待项目创建完成（约2分钟）

## 第二步：运行数据库 Schema

1. 在 Supabase 项目中，点击左侧菜单「SQL Editor」
2. 点击「New query」
3. 复制 `.project-docs/database/schema.sql` 的全部内容
4. 粘贴到 SQL Editor 中
5. 点击「Run」执行
6. 确认所有表和函数创建成功：
   - ✅ `terms` 表
   - ✅ `submissions` 表
   - ✅ `term_stats` 表
   - ✅ `users` 表
   - ✅ RLS 策略
   - ✅ RPC 函数（increment_term_views, increment_term_shares）

## 第三步：获取 API 凭证

1. 点击左侧菜单「Settings」 → 「API」
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...`（anon key）
   - **service_role**: `eyJhbGc...`（service role key，仅用于服务端）

## 第四步：配置环境变量

1. 在项目根目录创建 `.env.local` 文件
2. 复制 `.env.example` 的内容
3. 填写 Supabase 凭证：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# 管理员认证（用于审核面板）
ADMIN_TOKEN=your-secure-random-token-here
```

4. 保存文件

## 第五步：导入初始数据（可选）

### 方法1：通过 SQL Editor

1. 在 SQL Editor 中，创建新查询
2. 使用 `INSERT` 语句添加初始词条：

```sql
INSERT INTO terms (chinglish, wrong_example, correct_expression, correct_example, category, region, oxford_status, global_heat, risk_score, funny_score)
VALUES
('add oil', 'You need to add oil to finish this project!', 'cheer up / keep going', 'You need to keep going to finish this project!', ARRAY['日常', '口语'], ARRAY['中国大陆', '香港'], 'collected', 95, 8, 7),
('long time no see', 'Long time no see! How have you been?', 'It''s been a while / Haven''t seen you in ages', 'It''s been a while! How have you been?', ARRAY['日常', '口语'], ARRAY['全球'], 'collected', 92, 3, 5),
-- ... 更多词条
;
```

### 方法2：通过 Supabase Dashboard

1. 点击左侧菜单「Table Editor」
2. 选择 `terms` 表
3. 点击「Insert」→「Insert row」
4. 手动填写词条信息

## 第六步：更新应用代码

替换模拟数据为真实 Supabase 查询：

### 首页（app/page.tsx）

```typescript
// 删除 MOCK_TERMS
// import { MOCK_TERMS } from '...'

// 添加 Supabase 查询
import { createClient } from '@/lib/supabase/client';
import { getHotTerms, getRiskyTerms, getLatestTerms } from '@/lib/supabase/queries';

export default function HomePage() {
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTerms() {
      const { data } = await getHotTerms(supabase, 20);
      if (data) setTerms(data);
    }
    fetchTerms();
  }, []);

  // ... 其余代码
}
```

### 词条详情页（app/term/[id]/page.tsx）

```typescript
import { createClient } from '@/lib/supabase/server';
import { getTermById, incrementTermViews } from '@/lib/supabase/queries';

export default async function TermDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 获取词条
  const { data: term } = await getTermById(supabase, id);

  // 增加浏览次数
  if (term) {
    await incrementTermViews(supabase, id);
  }

  // ... 其余代码
}
```

### 投稿页面（app/submit/page.tsx）

```typescript
import { createClient } from '@/lib/supabase/client';
import { submitTerm } from '@/lib/supabase/queries';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  const supabase = createClient();
  const { data, error } = await submitTerm(supabase, {
    ...formData,
    category: selectedCategories,
    region: selectedRegions,
  });

  if (error) {
    alert('提交失败：' + error.message);
  } else {
    setSubmitSuccess(true);
  }

  setIsSubmitting(false);
};
```

## 第七步：测试应用

1. 重启开发服务器：
```bash
npm run dev
```

2. 访问 http://localhost:3000
3. 测试功能：
   - ✅ 首页加载词条
   - ✅ 搜索功能
   - ✅ 词条详情页
   - ✅ 榜单页面
   - ✅ 投稿功能

## 第八步：部署到 Vercel

1. 推送代码到 GitHub
2. 访问 [vercel.com](https://vercel.com)
3. 导入 GitHub 仓库
4. 配置环境变量（与 `.env.local` 相同）
5. 点击「Deploy」

---

## 常见问题

### Q: RLS 策略导致无法读取数据？

A: 检查 RLS 策略是否正确设置。默认情况下，`terms` 表允许所有人读取：

```sql
CREATE POLICY "Terms are viewable by everyone"
  ON terms FOR SELECT
  USING (true);
```

### Q: 如何添加管理员权限？

A: 在投稿审核功能开发后，使用 `ADMIN_TOKEN` 环境变量进行简单认证。

### Q: 如何备份数据？

A: Supabase 提供自动备份。也可以在「Database」→「Backups」中手动创建备份。

---

## 下一步

- [ ] 连接真实数据库
- [ ] 替换所有模拟数据
- [ ] 开发管理员审核面板
- [ ] 实现分享功能
- [ ] 部署到 Vercel
