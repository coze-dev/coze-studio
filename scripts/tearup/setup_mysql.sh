#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
timeout=30
while ! docker exec coze-mysql mysqladmin -ucoze -pcoze123 ping -h localhost --silent; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo -e "${RED}❌ MySQL startup timed out${NC}"
        exit 1
    fi
done

# 检查数据库存在性部分
echo -e "${GREEN}🔍 Checking database existence...${NC}"
timeout=30
while ! docker exec coze-mysql mysql -ucoze -pcoze123 -h127.0.0.1 -e "USE opencoze" 2>/dev/null; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Database 'opencoze' not created"
        exit 1
    fi
done

timeout=30
while ! docker exec coze-mysql mysql -ucoze -pcoze123 -h127.0.0.1 -e "USE opencoze" 2>/dev/null; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Database 'opencoze' not created"
        exit 1
    fi
done

echo -e "${GREEN}🔧 Initializing database...${NC}"

# 新增SQL字段校验逻辑
check_sql_schema() {
    local error_count=0
    local sql_file=$1

    # 使用awk解析SQL文件结构
    awk '
    BEGIN {
        IGNORECASE=1
        current_table=""
        error=0
    }
    /CREATE TABLE/ {
        # 增强表名提取逻辑，处理带/不带反引号的情况
        table_found=0
        for (i=3; i<=NF; i++) {
            # 处理带反引号的情况
            if ($i ~ /^`/) {
                current_table = $i
                sub(/`/, "", current_table)
                sub(/`.*/, "", current_table)
                table_found=1
                break
            }
            # 处理不带反引号的情况，跳过IF NOT EXISTS等关键字
            if ($i !~ /^(IF|NOT|EXISTS)/ && !table_found) {
                current_table = $i
                sub(/;/, "", current_table) # 去除可能的分号
                table_found=1
                break
            }
        }
    }
    /^[ ]*`(created_at|updated_at|deleted_at)`/ {
        field=$0
        
        # 更新正则表达式：允许bigint(unsigned)或bigint(任意数字)unsigned
        if ($0 ~ /`created_at`|`updated_at`/) {
            if (!match(field, /bigint(\([0-9]+\))?[[:space:]]+unsigned/)) {
                print "❌ 字段校验失败 [" current_table "." $2 "] 必须为 bigint unsigned 或 bigint(<数字>) unsigned"
                error=1
            }
        }
        
        # deleted_at保持原规则
        if ($0 ~ /`deleted_at`/) {
            if (!match(field, /bigint(\([0-9]+\))?[[:space:]]+unsigned/)) {
                print "❌ 字段校验失败 [" current_table ".deleted_at] 必须为 bigint unsigned 或 bigint(<数字>) unsigned"
                error=1
            }
            if ($0 ~ /NOT NULL/) {
                print "❌ 字段校验失败 [" current_table ".deleted_at] 不能有 NOT NULL 约束"
                error=1
            }
            if ($0 ~ /DEFAULT/) {
                print "❌ 字段校验失败 [" current_table ".deleted_at] 不能设置 DEFAULT 值"
                error=1
            }
        }
    }
    END {
        exit error
    }
    ' "$sql_file"

    return $?
}

SQL_FILES=$(find "$BACKEND_DIR/types/ddl" -type f -name "*.sql" | sort)
# 在脚本开头添加参数解析
DROP_TABLES=false
if [[ "$1" == "--drop-tables" ]]; then
    DROP_TABLES=true
    shift # 移除已处理的参数
    echo "🗑 正在删除数据库 opencoze 中所有表..."
    table_list=$(docker exec -i coze-mysql mysql -ucoze -pcoze123 -h127.0.0.1 -Nse "SELECT table_name FROM information_schema.tables WHERE table_schema='opencoze';")
    for tbl in $table_list; do
        echo "🗑  删除表: $tbl"
        docker exec -i coze-mysql mysql -ucoze -pcoze123 -h127.0.0.1 -f opencoze -e "DROP TABLE IF EXISTS \`$tbl\`"
    done
fi

# 修改原有SQL执行循环
for sql_file in $SQL_FILES; do
    echo "➡️ Executing $sql_file"

    # 执行SQL并捕获所有输出（移除 -f 参数）
    error_output=$(docker exec -i coze-mysql mysql -ucoze -pcoze123 -h127.0.0.1 opencoze <"$sql_file" 2>&1)
    exit_code=$?

    # 检查错误输出中是否包含错误关键字，即使exit code是0
    if [ $exit_code -ne 0 ] || echo "$error_output" | grep -qi "error\|failed\|syntax"; then
        # 忽略索引重复和表已存在的错误
        if echo "$error_output" | grep -q -E "Duplicate key name|Table '[^']*' already exists"; then
            echo "⚠️ 忽略索引或表重复创建的错误 ： $error_output"
            continue
        fi
        echo -e "\n❌ SQL执行失败: $sql_file"
        echo "错误信息:"
        echo "----------------------------------------"
        echo "$error_output"
        echo "----------------------------------------"
        exit 1
    fi
done

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MYSQL_CMD="docker exec -i coze-mysql mysql -ucoze -pcoze123 -h127.0.0.1 opencoze"

# 初始化用户表数据
echo "Initializing user table data..."

# 执行SQL初始化文件
SQL_INIT_FILE="${SCRIPT_DIR}/sql_dml/sql_init.sql"

if [ ! -f "$SQL_INIT_FILE" ]; then
    echo "Error: SQL initialization file not found: $SQL_INIT_FILE"
    exit 1
fi

echo "Executing SQL initialization file: $SQL_INIT_FILE"
$MYSQL_CMD <"$SQL_INIT_FILE"

if [ $? -eq 0 ]; then
    echo "SQL initialization completed successfully."
else
    echo "Error: Failed to execute SQL initialization file."
    exit 1
fi

echo "MySQL setup completed successfully."
exit 0
