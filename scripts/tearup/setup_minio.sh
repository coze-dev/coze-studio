#!/usr/bin/env bash

# 所有对数据的初始化操作均收拢到这个文件中
# 初始化数据时，要先检查数据是否已存在，保证脚本可幂等执行

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
ICON_DIR="${SCRIPT_DIR}/default_icon"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd ${SCRIPT_DIR}

go mod tidy
go run upload_to_minio.go
