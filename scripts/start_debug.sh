#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$BASE_DIR/backend"
DOCKER_DIR="$BASE_DIR/docker"
BIN_DIR="$BASE_DIR/bin"

echo "🔄 BASE_DIR: $BASE_DIR"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Directory not found: $BACKEND_DIR"
    exit 1
fi

rm -rf "$BIN_DIR/opencoze"

dir_created=0
[ ! -d "$DOCKER_DIR/data/mysql" ] && {
    mkdir -p "$DOCKER_DIR/data/mysql"
    dir_created=1
}
[ ! -d "$DOCKER_DIR/data/redis" ] && {
    mkdir -p "$DOCKER_DIR/data/redis"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/broker/store" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/broker/store"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/broker/logs" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/broker/logs"
    dir_created=1
}
[ ! -d "$DOCKER_DIR/data/rocketmq/namesrv/logs" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/namesrv/logs"
    dir_created=1
}

[ "$dir_created" -eq 1 ] && echo "📂 Creating data directories..."

echo "🐳 Starting Docker services..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" up -d || {
    echo "❌ Failed to start Docker services - aborting startup"
    exit 1
}

echo "⏳ Waiting for MySQL to be ready..."
timeout=30
while ! docker exec coze-mysql mysqladmin -uroot -proot ping -h localhost --silent; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ MySQL startup timed out"
        exit 1
    fi
done

# 检查数据库存在性部分
echo "🔍 Checking database existence..."
timeout=30
while ! docker exec coze-mysql mysql -uroot -proot -h127.0.0.1 --protocol=tcp -e "USE opencoze" 2>/dev/null; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Database 'opencoze' not created"
        exit 1
    fi
done

echo "🔍 Checking database existence..."
timeout=30
while ! docker exec coze-mysql mysql -uroot -proot -h127.0.0.1 --protocol=tcp -e "USE opencoze" 2>/dev/null; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Database 'opencoze' not created"
        exit 1
    fi
done

echo "🔧 Initializing database..."
docker exec coze-mysql bash -c 'echo -e "[client]\ndefault-character-set=utf8mb4" >> /root/.my.cnf'
docker exec coze-mysql bash -c 'echo -e "[client]\nuser=root\npassword=root\ndefault-character-set=utf8mb4" > /root/.my.cnf'

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
    table_list=$(docker exec -i coze-mysql mysql --defaults-extra-file=/root/.my.cnf -Nse "SELECT table_name FROM information_schema.tables WHERE table_schema='opencoze';")
    for tbl in $table_list; do
        echo "🗑  删除表: $tbl"
        docker exec -i coze-mysql mysql --defaults-extra-file=/root/.my.cnf --default-character-set=utf8mb4 -f opencoze -e "DROP TABLE IF EXISTS \`$tbl\`"
    done
fi

# 修改原有SQL执行循环
for sql_file in $SQL_FILES; do
    echo "➡️ Executing $sql_file"

    # 执行SQL并捕获所有输出（移除 -f 参数）
    error_output=$(docker exec -i coze-mysql mysql --defaults-extra-file=/root/.my.cnf opencoze <"$sql_file" 2>&1)
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

echo "🛠  Building Go project..."

cd $BACKEND_DIR &&
    go build -ldflags="-s -w" -o "$BIN_DIR/opencoze" main.go

# 添加构建失败检查
if [ $? -ne 0 ]; then
    echo "❌ Go build failed - aborting startup"
    exit 1
fi

echo "📑 Copying environment file..."
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" "$BIN_DIR/.env"
else
    echo "❌ .env file not found in $BACKEND_DIR"
    exit 1
fi

echo "🚀 Starting Go service..."
cd $BIN_DIR && "./opencoze"
