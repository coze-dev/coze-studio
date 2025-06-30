#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
BIN_DIR="$BASE_DIR/bin"
CONFIG_DIR="$BIN_DIR/resources/conf"
RESOURCES_DIR="$BIN_DIR/resources/"
DOCKER_DIR="$BASE_DIR/docker"

echo "🧹 Checking for goimports availability..."

if command -v goimports >/dev/null 2>&1; then
    echo "🧹 Formatting Go files with goimports..."
    find "$BACKEND_DIR" \
        -path "$BACKEND_DIR/api/model" -prune -o \
        -path "$BACKEND_DIR/api/router" -prune -o \
        -path "*/dal/query*" -prune -o \
        -path "*/mock/*" -prune -o \
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
if [ -f "$DOCKER_DIR/.env" ]; then
    cp "$DOCKER_DIR/.env" "$BIN_DIR/.env"
else
    echo "❌ .env file not found in $BACKEND_DIR"
    exit 1
fi

if [ -f "$DOCKER_DIR/cert.pem" ]; then
    cp "$DOCKER_DIR/cert.pem" "$BIN_DIR/cert.pem"
fi

if [ -f "$DOCKER_DIR/key.pem" ]; then
    cp "$DOCKER_DIR/key.pem" "$BIN_DIR/key.pem"
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
cp -r "$BACKEND_DIR/conf/model" "$CONFIG_DIR"

for arg in "$@"; do
    if [[ "$arg" == "-start" ]]; then
        echo "🚀 Starting Go service..."
        cd $BIN_DIR && ./opencoze "$@"
        exit 0
    fi
done
