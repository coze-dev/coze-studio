#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 连接MySQL数据库的命令
MYSQL_CMD="mysql -h 127.0.0.1 -P 3306 -u root -proot -D opencoze"

# 初始化用户表数据
echo "Initializing user table data..."

# 执行SQL初始化文件
SQL_INIT_FILE="${SCRIPT_DIR}/sql_dml/sql_init.sql"

if [ ! -f "$SQL_INIT_FILE" ]; then
    echo "Error: SQL initialization file not found: $SQL_INIT_FILE"
    exit 1
fi

echo "Executing SQL initialization file: $SQL_INIT_FILE"
$MYSQL_CMD < "$SQL_INIT_FILE"

if [ $? -eq 0 ]; then
    echo "SQL initialization completed successfully."
else
    echo "Error: Failed to execute SQL initialization file."
    exit 1
fi

echo "MySQL setup completed successfully."
exit 0