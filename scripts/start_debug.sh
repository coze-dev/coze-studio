#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$BASE_DIR/backend"
DOCKER_DIR="$BASE_DIR/docker"
BIN_DIR="$BASE_DIR/bin"
CONFIG_DIR="$BIN_DIR/resources/conf"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 BASE_DIR: $BASE_DIR${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

"${SCRIPT_DIR}"/tearup/setup_docker.sh || {
    echo -e "${RED}❌ setup_docker.sh failed${NC}"
    exit 1
}
"${SCRIPT_DIR}"/tearup/setup_mysql.sh "$@" || {
    echo -e "${RED}❌ setup_mysql.sh failed${NC}"
    exit 1
}
"${SCRIPT_DIR}"/tearup/setup_es.sh || {
    echo -e "${RED}❌ setup_es.sh failed${NC}"
    exit 1
}
"${SCRIPT_DIR}"/tearup/setup_minio.sh || {
    echo -e "${RED}❌ setup_minio.sh failed${NC}"
    exit 1
}

echo "🧹 Checking for goimports availability..."

if command -v goimports >/dev/null 2>&1; then
    echo "🧹 Formatting Go files with goimports..."
    find "$BACKEND_DIR" \
        -path "$BACKEND_DIR/api/model" -prune -o \
        -path "$BACKEND_DIR/api/router" -prune -o \
        -path "*/dal/query*" -prune -o \
        -path "*_mock.go" -prune -o \
        -path "*/dal/model*" -prune -o \
        -name "*.go" -exec goimports -w -local "code.byted.org/flow/opencoze" {} \;
else
    echo "⚠️ goimports not found, skipping Go file formatting."
fi

echo "🛠  Building Go project..."
rm -rf "$BIN_DIR/opencoze"
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

echo "📑 Cleaning configuration files..."
rm -rf "$CONFIG_DIR"
mkdir -p "$CONFIG_DIR"

echo "📑 Copying plugin configuration files..."
mkdir -p "$CONFIG_DIR/plugin/officialplugin"
cp "$BACKEND_DIR/conf/plugin/officialplugin/"* "$CONFIG_DIR/plugin/officialplugin"

echo "🚀 Starting Go service..."
cd $BIN_DIR && "./opencoze"
