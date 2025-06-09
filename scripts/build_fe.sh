#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
FRONTEND_DIR="${ROOT_DIR}/frontend"

set -ex

source "${SCRIPT_DIR}/setup_fe.sh"

pushd "${FRONTEND_DIR}"

echo "正在构建前端..."

BUILD_BRANCH=opencoze-local rush build -o @coze-studio/app --verbose

popd

# 复制构建产物到后端静态目录
echo -e "${YELLOW}正在复制构建产物到后端静态目录...${NC}"
BACKEND_STATIC_DIR="${SCRIPT_DIR}/../backend/static"
FRONTEND_DIST_DIR="${FRONTEND_DIR}/apps/coze-studio/dist"

# 创建后端静态目录（如果不存在）
mkdir -p "${BACKEND_STATIC_DIR}"

# 清空目标目录并复制新的构建产物
rm -rf "${BACKEND_STATIC_DIR}"/*
cp -r "${FRONTEND_DIST_DIR}"/* "${BACKEND_STATIC_DIR}/"

echo -e "${GREEN}构建产物复制完成！${NC}"
echo -e "${GREEN}前端文件已复制到: ${BACKEND_STATIC_DIR}${NC}"

