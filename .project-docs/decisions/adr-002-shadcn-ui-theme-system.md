# ADR-002: 使用 shadcn/ui 主题系统作为唯一 UI 组件来源

**状态**: 已采纳
**日期**: 2024-12-22
**决策者**: 开发团队

## 背景

项目需要一个统一的 UI 组件库和设计系统。用户明确要求使用 shadcn/ui 官方主题系统，并将其作为"整个项目的设计系统和唯一的 UI 组件来源"。

## 决策

采用 **shadcn/ui 官方主题系统** 作为项目唯一的 UI 组件来源，并基于熊猫黑白主题进行定制。

## 决策理由

### 1. 统一的设计语言
- 所有 UI 组件来自同一套设计系统
- 视觉风格一致
- 避免组件样式冲突

### 2. 开箱即用的主题系统
- 支持深色/浅色模式自动切换
- CSS 变量驱动，易于自定义
- 所有组件自动适配主题

### 3. 高质量组件
- 基于 Radix UI，可访问性强（a11y）
- TypeScript 类型完整
- 维护活跃，社区支持好

### 4. 灵活的定制能力
- 可以通过 CSS 变量自定义配色
- 可以修改组件源码（复制到项目中）
- 符合项目"熊猫黑白"主题需求

### 5. 零 Runtime CSS
- 使用 Tailwind CSS，编译时生成样式
- 性能优异
- 无需额外的 CSS-in-JS 库

## 实施方案

### 主题配置
```
lib/styles/
├── globals.css          # shadcn/ui 基础样式
├── themes/
│   └── panda.css       # 自定义熊猫主题
└── theme-config.ts     # 主题配置导出
```

### 配色方案（熊猫黑白主题）
- **浅色模式**: 白色背景（#FFFFFF）+ 黑色主色调（#1a1a1a）
- **深色模式**: 黑色背景（#0a0a0a）+ 白色主色调（#FFFFFF）
- **语义色**:
  - 错误红: #FF4D4F（Chinglish 标记）
  - 成功绿: #52C41A（正确表达）
  - 警告橙: #FA8C16
  - 信息蓝: #1890FF

### 组件结构
```
components/
├── ui/                  # shadcn/ui 组件（CLI 安装）
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── features/           # 业务组件（基于 ui 组件构建）
    ├── term/
    │   ├── TermCard.tsx
    │   └── ...
    └── ...
```

### 安装方式
```bash
# 1. 初始化 shadcn/ui
npx shadcn-ui@latest init

# 2. 按需安装组件
npx shadcn-ui@latest add button card input ...
```

## 约束和规范

### ✅ 必须遵守
1. **所有 UI 组件必须从 shadcn/ui 安装** - 禁止使用其他 UI 库
2. **业务组件必须基于 ui 组件构建** - 不允许直接写原生 HTML
3. **使用 Tailwind CSS 类名** - 不允许写内联样式或独立 CSS 文件
4. **统一使用主题变量** - 颜色必须使用 CSS 变量（如 `hsl(var(--error))`）

### ❌ 禁止行为
1. 安装其他 UI 组件库（如 Material-UI、Ant Design）
2. 直接使用原生 HTML 元素构建复杂组件
3. 硬编码颜色值（如 `className="text-red-500"`）
4. 绕过主题系统自定义样式

## 影响

### 正面影响
- 设计系统高度统一
- 开发效率提升（复用组件）
- 维护成本降低
- 主题切换无缝

### 负面影响
- 组件库学习成本（但文档完善）
- 特殊需求可能需要自定义组件

## 后续工作

1. ✅ 配置 `components.json`
2. ✅ 创建熊猫主题 CSS 变量
3. ✅ 安装核心 UI 组件
4. ✅ 创建业务组件示例
5. ✅ 编写组件使用指南

## 相关文档

- [shadcn/ui 官方文档](https://ui.shadcn.com)
- [项目配色方案](/design-system/color-palette.md)
- [组件使用指南](/design-system/components-guide.md)
