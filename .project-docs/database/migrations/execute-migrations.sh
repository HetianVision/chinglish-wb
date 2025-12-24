#!/bin/bash

# =============================================
# Chinglish WB - Profiles 表迁移执行脚本
# =============================================
# 用途：自动执行 profiles 表和触发器的数据库迁移
# 使用方法：
#   1. 确保已设置 SUPABASE_DB_URL 环境变量
#   2. 运行：bash execute-migrations.sh
# =============================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 检查 psql 是否安装
check_psql() {
    if ! command -v psql &> /dev/null; then
        print_error "psql 未安装，请先安装 PostgreSQL 客户端"
        print_info "macOS: brew install postgresql"
        print_info "Ubuntu: sudo apt-get install postgresql-client"
        exit 1
    fi
}

# 检查环境变量
check_env() {
    if [ -z "$SUPABASE_DB_URL" ]; then
        print_error "未设置 SUPABASE_DB_URL 环境变量"
        print_info "请设置数据库连接字符串："
        print_info "  export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
        exit 1
    fi
}

# 执行 SQL 文件
execute_sql() {
    local file=$1
    local description=$2

    print_info "执行: $description"
    print_info "文件: $file"

    if [ ! -f "$file" ]; then
        print_error "文件不存在: $file"
        exit 1
    fi

    if psql "$SUPABASE_DB_URL" -f "$file" > /tmp/migration_output.log 2>&1; then
        print_success "$description 执行成功"

        # 显示输出中的 NOTICE 和统计信息
        if grep -E "(NOTICE|✓|⚠)" /tmp/migration_output.log > /dev/null 2>&1; then
            echo ""
            grep -E "(NOTICE|✓|⚠)" /tmp/migration_output.log | sed 's/^/  /'
            echo ""
        fi
    else
        print_error "$description 执行失败"
        echo ""
        cat /tmp/migration_output.log
        exit 1
    fi
}

# 确认操作
confirm_action() {
    local message=$1
    print_warning "$message"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "操作已取消"
        exit 0
    fi
}

# 主函数
main() {
    print_header "Chinglish WB - 数据库迁移工具"

    # 解析命令行参数
    ACTION=${1:-"migrate"}

    case $ACTION in
        migrate)
            print_info "开始执行迁移..."
            check_psql
            check_env

            # 确认操作
            confirm_action "即将执行 profiles 表迁移，这将创建新表和触发器。"

            # 执行迁移脚本
            execute_sql "$SCRIPT_DIR/001_add_profiles_trigger.sql" "创建 profiles 表和触发器"
            execute_sql "$SCRIPT_DIR/002_backfill_existing_users.sql" "回填现有用户数据"

            print_success "迁移完成！"
            print_info "下一步："
            print_info "  1. 在 Supabase Dashboard 中验证 profiles 表"
            print_info "  2. 测试用户注册和登录功能"
            print_info "  3. 检查前端是否能正确获取用户资料"
            ;;

        rollback)
            print_warning "开始执行回滚..."
            check_psql
            check_env

            # 强烈警告
            confirm_action "警告：回滚将删除 profiles 表的所有数据！此操作不可逆。"
            confirm_action "请再次确认：是否真的要删除所有用户资料数据？"

            # 执行回滚脚本
            execute_sql "$SCRIPT_DIR/rollback_profiles_trigger.sql" "回滚 profiles 表和触发器"

            print_success "回滚完成"
            ;;

        verify)
            print_info "验证迁移状态..."
            check_psql
            check_env

            # 验证 SQL 查询
            VERIFY_SQL="
                -- 检查 profiles 表是否存在
                SELECT 'profiles 表状态: ' || CASE WHEN EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'profiles'
                ) THEN '✓ 已创建' ELSE '✗ 不存在' END;

                -- 检查触发器是否存在
                SELECT 'on_auth_user_created 触发器: ' || CASE WHEN EXISTS (
                    SELECT 1 FROM information_schema.triggers
                    WHERE trigger_name = 'on_auth_user_created'
                ) THEN '✓ 已创建' ELSE '✗ 不存在' END;

                -- 检查用户数据同步
                SELECT
                    '用户数据统计:' as info,
                    (SELECT COUNT(*) FROM auth.users) as auth_users,
                    (SELECT COUNT(*) FROM public.profiles) as profiles,
                    CASE WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles)
                        THEN '✓ 同步完整'
                        ELSE '⚠ 存在差异'
                    END as sync_status;
            "

            echo "$VERIFY_SQL" | psql "$SUPABASE_DB_URL"
            ;;

        help|--help|-h)
            print_header "使用说明"
            echo "用法: bash execute-migrations.sh [ACTION]"
            echo ""
            echo "可用的 ACTION:"
            echo "  migrate  (默认) - 执行迁移（创建 profiles 表和触发器）"
            echo "  rollback        - 回滚迁移（删除 profiles 表和触发器）"
            echo "  verify          - 验证迁移状态"
            echo "  help            - 显示此帮助信息"
            echo ""
            echo "环境变量:"
            echo "  SUPABASE_DB_URL - Supabase 数据库连接字符串"
            echo ""
            echo "示例:"
            echo "  export SUPABASE_DB_URL='postgresql://postgres:password@db.xxx.supabase.co:5432/postgres'"
            echo "  bash execute-migrations.sh migrate"
            echo "  bash execute-migrations.sh verify"
            echo "  bash execute-migrations.sh rollback"
            ;;

        *)
            print_error "未知的操作: $ACTION"
            print_info "使用 'bash execute-migrations.sh help' 查看帮助"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
