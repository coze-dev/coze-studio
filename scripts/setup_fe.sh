#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

set -e

# 设置颜色变量
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

pushd "${SCRIPT_DIR}/../frontend"

# 检查 Node.js 是否安装
echo "正在检查 Node.js 是否已安装..."
if ! command -v node &> /dev/null; then
    echo "${RED}错误: 未检测到 Node.js${NC}"
    echo "${YELLOW}请安装 Node.js 后再继续。推荐使用 nvm 进行安装：${NC}"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash"
    echo "  nvm install --lts"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo "${GREEN}Node.js 已安装: ${NODE_VERSION}${NC}"
fi


# 检查 Rush 是否安装
echo "正在检查 Rush 是否已安装..."
if ! command -v rush &> /dev/null; then
    echo "${YELLOW}未检测到 Rush，正在为您安装...${NC}"
    npm i -g @microsoft/rush
else
    RUSH_VERSION=$(rush version)
    echo "${GREEN}Rush 已安装: ${RUSH_VERSION}${NC}"
fi

echo "${GREEN}环境检查完成！${NC}"

rush update

echo "${GREEN}环境检查完成！${NC}"

BUILD_BRANCH=opencoze-local rush build -o @coze-studio/app --verbose

echo "${GREEN}构建完成！${NC}"

popd