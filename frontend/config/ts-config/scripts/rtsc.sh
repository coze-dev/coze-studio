#!/usr/bin/env bash
BASE_DIR=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

# 某些系统可能没有 realpath 命令，
if ! command -v realpath &>/dev/null; then
    echo "未找到 realpath 命令"
    echo "请执行以下命令安装必要依赖"
    echo "  brew install coreutils"
    exit 1
fi
ROOT_DIR=$(realpath "$BASE_DIR/../")

bash "$ROOT_DIR/node_modules/.bin/tsc" "$@"
