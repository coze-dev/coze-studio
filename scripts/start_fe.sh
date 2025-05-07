#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${1:-${SCRIPT_DIR}/../frontend}"

pushd "${FRONTEND_DIR}/apps/coze-studio"
echo -e "正在进入前端构建产物目录: ${FRONTEND_DIR}/apps/coze-studio"

# 检查 dist 目录是否存在且非空
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo -e "dist 目录不存在或为空，执行初始化环境..."
  sh ./setup.sh
else
  echo "dist 目录已存在且非空，跳过初始化环境"
fi
popd

echo -e "正在启动前端服务..."
node "${FRONTEND_DIR}/apps/coze-studio-server/debug.js"