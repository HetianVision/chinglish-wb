# Supabase 数据库配置完整操作指南

## 📍 开始之前

请准备好：
- ✅ 您的 Supabase 项目地址：https://bdndxbcmdvsgmapmgalh.supabase.co
- ✅ 本地项目路径：`/Users/wangfei/Documents/VibeCodinig/ChinglishWB`

---

## 第一步：创建数据库表结构 (3分钟)

### 1.1 打开 Supabase 控制台

1. 在浏览器中访问：**https://supabase.com**
2. 点击右上角 **Sign in** 登录您的账号
3. 登录后，您会看到项目列表，找到并点击您的项目

### 1.2 进入 SQL 编辑器

1. 在左侧菜单栏中，找到并点击 **SQL Editor** (图标像 `</>`)
   ```
   侧边栏菜单：
   ├── Home
   ├── Table Editor
   ├── SQL Editor  ← 点击这里
   ├── Database
   └── ...
   ```

2. 点击右上角的 **+ New Query** 按钮（绿色按钮）

### 1.3 复制 schema.sql 内容

**方法1：使用终端复制（推荐）**

1. 打开终端（Terminal）
2. 运行以下命令复制文件内容到剪贴板：
   ```bash
   cat /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/database/schema.sql | pbcopy
   ```
   > 💡 `pbcopy` 会自动将内容复制到您的剪贴板

**方法2：手动复制**

1. 打开 Finder（访达）
2. 按 `Command + Shift + G` 并输入：
   ```
   /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/database
   ```
3. 双击 `schema.sql` 文件（用文本编辑器打开）
4. `Command + A` 全选，`Command + C` 复制

### 1.4 粘贴并执行

1. 在 Supabase SQL Editor 中，按 `Command + V` 粘贴代码
2. 点击右下角的绿色 **Run** 按钮（或按 `Command + Enter`）

### 1.5 验证结果

执行完成后，您应该看到：
```
Success. No rows returned
```

然后在左侧 Table Editor 中应该能看到4个新表：
- ✅ `terms`
- ✅ `submissions`
- ✅ `term_stats`
- ✅ `users`

**验证方法**：
1. 点击左侧 **Table Editor**
2. 应该能看到上述4个表

---

## 第二步：导入500条测试数据 (2分钟)

### 2.1 新建查询

1. 返回 **SQL Editor**
2. 再次点击 **+ New Query** 创建新查询

### 2.2 复制测试数据

**使用终端复制（推荐）**：
```bash
cat /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.project-docs/database/seed-data-500-complete.sql | pbcopy
```

或手动打开文件：
```
路径：.project-docs/database/seed-data-500-complete.sql
```

### 2.3 粘贴并执行

1. `Command + V` 粘贴
2. 点击 **Run** 按钮执行

### 2.4 查看结果

执行完成后，您会看到类似这样的输出：

```
total_records | oxford_collected | avg_heat | avg_risk | avg_funny | total_views | total_shares
--------------|------------------|----------|----------|-----------|-------------|-------------
500           | 75               | 69       | 6        | 6         | 6234567     | 123456

category | count
---------|------
日常      | 245
商务      | 198
网络      | 176
...

✅ 500条测试数据导入完成！
```

### 2.5 验证数据

**方法1：在 Table Editor 查看**
1. 点击左侧 **Table Editor**
2. 点击 `terms` 表
3. 应该能看到500条数据

**方法2：运行查询验证**
```sql
SELECT COUNT(*) FROM terms;
-- 应该返回：500
```

---

## 第三步：测试网站 (5分钟)

### 3.1 确认开发服务器运行

1. 打开终端
2. 检查服务器是否在运行：
   ```bash
   curl http://localhost:3001
   ```
   - 如果有输出HTML，说明服务器正在运行 ✅
   - 如果提示连接失败，需要启动服务器：
     ```bash
     cd /Users/wangfei/Documents/VibeCodinig/ChinglishWB
     npm run dev
     ```

### 3.2 打开网站

在浏览器中访问：**http://localhost:3001**

### 3.3 测试功能清单

#### ✅ 首页测试
- [ ] 能看到熊猫emoji 🐼
- [ ] 能看到"Chinglish 黑白语言站"标题
- [ ] 搜索框可以输入
- [ ] 看到3个标签：🔥热门 / ⚠️高风险 / 🆕最新
- [ ] 每个标签下能看到词条卡片
- [ ] 卡片显示 Chinglish 表达和正确表达

**测试搜索**：
1. 在搜索框输入 `test`
2. 应该能看到包含 "Test" 的搜索结果
3. 输入 `add oil`
4. 应该能看到 "add oil" 词条

#### ✅ 词条详情测试
1. 点击任意词条卡片
2. 应该跳转到详情页（URL类似：`/term/xxx-xxx-xxx`）
3. 详情页应该显示：
   - [ ] 错误示例（红色）
   - [ ] 正确示例（绿色）
   - [ ] 4个评分指标：🔥热度 / ⚠️风险 / 😄趣味 / 👀浏览
   - [ ] 分类标签
   - [ ] 地区标签
   - [ ] 相关词条推荐

#### ✅ 榜单页面测试
1. 点击顶部导航的 **榜单** 按钮
2. 应该看到6个榜单标签
3. 切换每个标签，都应该有数据显示：
   - [ ] 🔥 热门
   - [ ] ⚠️ 风险
   - [ ] 😄 趣味
   - [ ] 👀 浏览
   - [ ] 📤 分享
   - [ ] 📖 牛津

#### ✅ 投稿功能测试
1. 点击顶部导航的 **投稿** 按钮
2. 填写表单：
   - Chinglish表达：`test submission`
   - 错误示例：`This is a test submission.`
   - 正确表达：`This is a test`
   - 正确示例：`This is a test.`
   - 选择至少1个分类（点击Badge）
3. 点击 **提交投稿** 按钮
4. 应该看到 🎉 投稿成功页面
5. 3秒后自动跳转首页

**验证投稿数据**：
在 Supabase SQL Editor 中运行：
```sql
SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 5;
```
应该能看到您刚才的投稿（状态为 `pending`）

---

## 🎉 成功标志

如果以上测试都通过，说明：
- ✅ 数据库表创建成功
- ✅ 500条测试数据导入成功
- ✅ 前后端连接正常
- ✅ 所有功能工作正常

您可以截图发给我，让我看看效果！

---

## ⚠️ 常见问题排查

### 问题1：网站显示"暂无数据"

**可能原因**：
1. 数据库表没创建成功
2. 数据没导入成功
3. 环境变量配置错误

**解决方法**：
1. 在 Supabase Table Editor 检查 `terms` 表是否有500条数据
2. 检查 `.env.local` 文件是否存在且配置正确：
   ```bash
   cat /Users/wangfei/Documents/VibeCodinig/ChinglishWB/.env.local
   ```
3. 重启开发服务器：
   ```bash
   # 按 Ctrl+C 停止服务器
   npm run dev  # 重新启动
   ```

### 问题2：浏览器控制台报错

**检查步骤**：
1. 打开浏览器
2. 按 `F12` 或 `Command + Option + I` 打开开发者工具
3. 点击 **Console** 标签
4. 截图错误信息发给我

### 问题3：SQL执行报错

**常见错误**：
- `relation "terms" already exists`
  - 说明表已经存在，可以跳过 schema.sql
  - 或者先运行：`DROP TABLE terms CASCADE;` 然后重新执行

- `syntax error`
  - 检查是否完整复制了整个SQL文件
  - 确保没有多余的字符

### 问题4：数据导入慢

**正常现象**：
- 导入500条数据大约需要5-10秒
- 等待执行完成，不要中断

---

## 📞 需要帮助？

如果遇到任何问题：
1. 截图错误信息
2. 告诉我在哪一步遇到问题
3. 我会立即帮您解决！

---

## 🎯 完成后的下一步

数据导入成功后，我们可以继续：
1. 📝 开发管理员审核面板（审核用户投稿）
2. 📤 实现分享功能（生成精美卡片图片）
3. 🚀 部署到 Vercel（让全世界看到）

准备好了就告诉我！ 🚀
