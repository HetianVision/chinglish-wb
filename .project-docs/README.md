# Chinglish 黑白语言站 - 项目文档

本文件夹包含了项目开发过程中的所有重要文档和决策记录。

## 📁 文件夹结构

### /conversations
记录与 Claude 的重要对话和需求讨论。

### /decisions
技术决策记录（ADR - Architecture Decision Records），记录为什么做出某个技术选择。

### /database
数据库相关文档：
- `schema.sql` - 完整的数据库表结构
- `migrations/` - 数据库迁移脚本
- `seed-data.sql` - 初始数据

### /design-system
设计系统文档：
- 主题配置说明
- 组件使用指南
- 配色方案
- 字体规范

### /api-docs
API接口文档

### /progress
开发进度和里程碑记录

## 🎯 文档目的

1. **可追溯性** - 记录每个重要决策的原因和背景
2. **可维护性** - 帮助团队成员快速理解项目架构
3. **可交接性** - 新成员可以通过文档快速上手
4. **知识沉淀** - 记录开发过程中的经验和教训

## 📝 文档更新规范

- 重要对话后更新 `/conversations`
- 技术选型变更时更新 `/decisions`
- 数据库变更时更新 `/database`
- 完成里程碑时更新 `/progress`
