# ADR-001: 选择 Supabase 而非 Vercel KV

**状态**: 已采纳
**日期**: 2024-12-22
**决策者**: 开发团队

## 背景

项目需要一个数据存储方案来管理 Chinglish 词条、用户投稿、统计数据等。初始方案考虑使用 JSON 文件 + Vercel KV，但用户明确要求后期接入 Supabase。

## 决策

从项目一开始就使用 **Supabase PostgreSQL** 作为主要数据存储方案，而不是先用 JSON/Vercel KV 再迁移。

## 考虑的方案

### 方案 A: JSON 文件 + Vercel KV（原方案）
**优点**:
- 快速启动，无需配置数据库
- 开发成本低
- 适合 MVP 快速验证

**缺点**:
- 数据迁移成本高
- 功能受限（无全文搜索、无实时订阅）
- 需要重构代码
- 不是生产就绪方案

### 方案 B: Supabase PostgreSQL（采纳方案）
**优点**:
- 生产级数据库，可直接扩展
- 自动生成 TypeScript 类型定义
- 内置全文搜索（PostgreSQL FTS）
- 实时订阅（管理员审核即时更新）
- Row Level Security（RLS）数据安全
- 免费额度充足（500MB 数据库 + 50MB 文件存储）
- 自动备份和迁移工具
- 内置认证系统（后续扩展用户功能）

**缺点**:
- 需要注册 Supabase 账号
- 初期配置略复杂
- 需要环境变量管理

## 决策理由

1. **避免技术债**: 从一开始使用正确的方案，避免后期迁移的痛苦
2. **用户明确需求**: 用户已明确表示后期要接入 Supabase
3. **功能需求**: 全文搜索、实时更新等功能是 MVP 必需的
4. **成本可控**: Supabase 免费额度足够 MVP 使用，后期付费也合理
5. **开发体验**: 自动生成类型定义，减少手动维护成本

## 影响

- 需要用户注册 Supabase 账号
- 需要配置环境变量
- 数据库 schema 需要在项目初期定义清楚
- 开发时需要网络连接（可使用 Supabase 本地开发环境）

## 实施计划

1. 用户创建 Supabase 项目
2. 运行数据库 schema（已在计划文档中定义）
3. 配置 RLS 策略
4. 在项目中集成 `@supabase/supabase-js` 和 `@supabase/ssr`
5. 配置环境变量

## 相关文档

- [Supabase 数据库 Schema](/database/schema.sql)
- [Supabase 官方文档](https://supabase.com/docs)
