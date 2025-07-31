#!/usr/bin/env bash
BASE_DIR=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

# Some systems may not have the realpath command.
if ! command -v realpath &>/dev/null; then
    echo "未找到 realpath 命令"
    echo "请执行以下命令安装必要依赖"
    echo "  brew install coreutils"
    exit 1
fi
ROOT_DIR=$(realpath "$BASE_DIR/../")

args=("--cache")

if [ "$CI" = "true" ]; then
    args+=("--quiet")
fi

bash "$ROOT_DIR/node_modules/.bin/eslint" "${args[@]}" "$@"
