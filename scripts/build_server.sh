#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$BASE_DIR/backend"
BIN_DIR="$BASE_DIR/bin"
CONFIG_DIR="$BIN_DIR/resources/conf"
RESOURCES_DIR="$BIN_DIR/resources/"

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

echo "✅ Build completed successfully!"

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
mkdir -p "$CONFIG_DIR/plugin/pluginproduct"
mkdir -p "$CONFIG_DIR/plugin/common"
mkdir -p "$CONFIG_DIR/prompt"
cp "$BACKEND_DIR/conf/plugin/pluginproduct/"* "$CONFIG_DIR/plugin/pluginproduct"
cp "$BACKEND_DIR/conf/plugin/common/"* "$CONFIG_DIR/plugin/common"
cp "$BACKEND_DIR/conf/prompt/"* "$CONFIG_DIR/prompt"
cp -r "$BACKEND_DIR/static" "$RESOURCES_DIR"

for arg in "$@"; do
    if [[ "$arg" == "-start" ]]; then
        echo "🚀 Starting Go service..."
        cd $BIN_DIR && ./opencoze "$@"
        exit 0
    fi
done
