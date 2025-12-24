#!/bin/bash

# Chinglish 黑白语言站 - Vercel 快速部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即停止

echo "🐼 Chinglish 黑白语言站 - Vercel 部署脚本"
echo "=================================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤 1: 检查环境
echo "📋 步骤 1/6: 检查环境..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未安装 Node.js${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 未安装 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 和 npm 已安装${NC}"
echo ""

# 步骤 2: 检查 .env.local
echo "📋 步骤 2/6: 检查环境变量..."
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ 未找到 .env.local 文件${NC}"
    echo "请先创建 .env.local 文件并配置 Supabase 凭证"
    exit 1
fi

# 检查必需的环境变量
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "ADMIN_TOKEN")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ 缺少以下环境变量:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo -e "${GREEN}✅ 环境变量配置完整${NC}"
echo ""

# 步骤 3: 安装依赖
echo "📋 步骤 3/6: 安装依赖..."
npm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 步骤 4: 运行 Lint
echo "📋 步骤 4/6: 运行代码检查..."
npm run lint
echo -e "${GREEN}✅ Lint 检查通过${NC}"
echo ""

# 步骤 5: 构建测试
echo "📋 步骤 5/6: 测试生产构建..."
npm run build
echo -e "${GREEN}✅ 构建成功${NC}"
echo ""

# 步骤 6: 提示部署选项
echo "📋 步骤 6/6: 选择部署方式"
echo "=================================================="
echo ""
echo "您的项目已准备好部署！请选择以下方式之一："
echo ""
echo -e "${YELLOW}方式 1: 使用 Vercel CLI (推荐)${NC}"
echo "   1. 安装 Vercel CLI:"
echo "      npm install -g vercel"
echo ""
echo "   2. 登录 Vercel:"
echo "      vercel login"
echo ""
echo "   3. 部署项目:"
echo "      vercel --prod"
echo ""
echo "   4. 配置环境变量 (参考 .project-docs/ENV_VARIABLES_TEMPLATE.md):"
echo "      vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "      vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo "      vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "      vercel env add ADMIN_TOKEN production"
echo ""
echo -e "${YELLOW}方式 2: 使用 GitHub 自动部署${NC}"
echo "   1. 将代码推送到 GitHub:"
echo "      git add ."
echo "      git commit -m 'ready for production deployment'"
echo "      git push origin main"
echo ""
echo "   2. 访问 https://vercel.com"
echo "   3. 点击 'Add New Project'"
echo "   4. 选择您的 GitHub 仓库"
echo "   5. 在 Settings → Environment Variables 中配置环境变量"
echo "      (参考 .project-docs/ENV_VARIABLES_TEMPLATE.md)"
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 准备工作完成！${NC}"
echo ""
echo "详细部署指南请查看:"
echo "  .project-docs/VERCEL_DEPLOYMENT_GUIDE.md"
echo ""

# 询问是否立即部署
read -p "是否立即使用 Vercel CLI 部署？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v vercel &> /dev/null; then
        echo "🚀 开始部署..."
        vercel --prod
    else
        echo -e "${YELLOW}⚠️  未安装 Vercel CLI${NC}"
        echo "请先运行: npm install -g vercel"
    fi
else
    echo "您可以稍后手动部署。"
fi
