#!/bin/bash

# MySQL数据库初始化脚本
# 用于初始化OpenCoze项目的数据库schema

set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 开始初始化OpenCoze数据库...${NC}"

# 检查Atlas是否已安装
if ! command -v atlas &> /dev/null; then
    echo -e "${RED}❌ Atlas未安装，请先安装Atlas:${NC}"
    echo -e "${YELLOW}macOS: brew install ariga/tap/atlas${NC}"
    echo -e "${YELLOW}Linux: curl -sSf https://atlasgo.sh | sh -s -- --community${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Atlas已安装，版本: $(atlas version)${NC}"

# 检查.env文件是否存在
if [ ! -f "docker/.env" ]; then
    echo -e "${RED}❌ docker/.env文件不存在，请先创建环境配置文件${NC}"
    exit 1
fi

# 加载环境变量
source docker/.env

if [ -z "$ATLAS_URL" ]; then
    echo -e "${RED}❌ ATLAS_URL环境变量未设置${NC}"
    exit 1
fi

echo -e "${GREEN}📊 数据库连接信息:${NC}"
echo -e "  主机: ${MYSQL_HOST}:${MYSQL_PORT}"
echo -e "  数据库: ${MYSQL_DATABASE}"
echo -e "  用户: ${MYSQL_USER}"

# 进入atlas目录
cd docker/atlas

echo -e "${GREEN}📋 开始应用数据库migrations...${NC}"
echo -e "${YELLOW}基线版本: 20250703095335${NC}"
echo -e "${YELLOW}目标版本: 20250717125913${NC}"

# 应用数据库migrations
# 注意：如果遇到utf8mb4_0900_ai_ci排序规则错误，需要手动修改migration文件
atlas migrate apply \
    --url "$ATLAS_URL" \
    --dir "file://migrations" \
    --baseline "20250703095335"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库初始化成功！${NC}"
    echo -e "${GREEN}📈 已应用的migrations:${NC}"
    echo -e "  - 20250703095335_initial.sql (初始schema)"
    echo -e "  - 20250703115304_update.sql"
    echo -e "  - 20250704040445_update.sql"
    echo -e "  - 20250708075302_update.sql"
    echo -e "  - 20250710100212_update.sql"
    echo -e "  - 20250711034533_update.sql"
    echo -e "  - 20250717125913_update.sql (最新版本)"
else
    echo -e "${RED}❌ 数据库初始化失败${NC}"
    echo -e "${YELLOW}💡 常见问题解决方案:${NC}"
    echo -e "  1. 检查数据库连接是否正常"
    echo -e "  2. 确认数据库用户有足够权限"
    echo -e "  3. 如遇到utf8mb4_0900_ai_ci错误，需要修改migration文件中的排序规则"
    echo -e "     将 'utf8mb4_0900_ai_ci' 替换为 'utf8mb4_unicode_ci'"
    exit 1
fi

echo -e "${GREEN}🎉 OpenCoze数据库初始化完成！${NC}"