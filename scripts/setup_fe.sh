#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${1:-${SCRIPT_DIR}/../frontend}"

set -ex

# Set color variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

pushd "${FRONTEND_DIR}"
echo "正在进入前端目录: ${FRONTEND_DIR}"

# Check if Node.js is installed
echo -e "正在检查 Node.js 是否已安装..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未检测到 Node.js${NC}"
    echo -e "${YELLOW}请安装 Node.js 后再继续。推荐使用 nvm 进行安装：${NC}"
    echo -e "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash"
    echo -e "  nvm install --lts"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}Node.js 已安装: ${NODE_VERSION}${NC}"
fi


# Check if Rush is installed
echo -e "正在检查 Rush 是否已安装..."
if ! command -v rush &> /dev/null; then
    echo -e "${YELLOW}未检测到 Rush，正在为您安装...${NC}"
    npm i -g @microsoft/rush
else
    RUSH_VERSION=$(rush version)
    echo -e "${GREEN}Rush 已安装: ${RUSH_VERSION}${NC}"
fi

echo -e "${GREEN}环境检查完成！${NC}"

echo -e "${YELLOW}开始安装依赖...${NC}"
rush update

echo -e "${GREEN}依赖安装完成！${NC}"



# echo -e "${NC}"
# Echo -e "${GREEN} build complete! ${NC}"

popd