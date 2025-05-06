#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

pushd "${SCRIPT_DIR}/../frontend/apps/coze-studio"

# 检查 dist 目录是否存在且非空
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo "dist 目录不存在或为空，执行初始化环境..."
  sh ./setup.sh
else
  echo "dist 目录已存在且非空，跳过初始化环境"
fi

popd

node "${SCRIPT_DIR}/../frontend/apps/coze-studio/server.js"