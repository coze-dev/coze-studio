#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../../docker" && pwd)"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ ! -d "$DOCKER_DIR" ]; then
    echo -e "${RED}❌ Directory not found: $DOCKER_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}📂 Creating docker data directories...${NC}"

dir_created=0
[ ! -d "$DOCKER_DIR/data/mysql" ] && {
    mkdir -p "$DOCKER_DIR/data/mysql"
    chown -R 999:999 "$DOCKER_DIR/data/mysql"
    dir_created=1
}
[ ! -d "$DOCKER_DIR/data/redis" ] && {
    mkdir -p "$DOCKER_DIR/data/redis"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/broker/store" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/broker/store"
    chown -R 999:999 "$DOCKER_DIR/data/rocketmq/broker/store"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/broker/logs" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/broker/logs"
    chown -R 999:999 "$DOCKER_DIR/data/rocketmq/broker/logs"
    dir_created=1
}
[ ! -d "$DOCKER_DIR/data/rocketmq/namesrv/logs" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/namesrv/logs"
    chown -R 999:999 "$DOCKER_DIR/data/rocketmq/namesrv/logs"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/namesrv/store" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/namesrv/store"
    chown -R 999:999 "$DOCKER_DIR/data/rocketmq/namesrv/store"
    dir_created=1
}

[ "$dir_created" -eq 1 ] && echo -e "${GREEN}📂 Creating docker data directories...${NC}"

echo -e "${GREEN}🐳 Starting Docker services...${NC}"
docker compose -f "$DOCKER_DIR/docker-compose.yml" up -d || {
    echo -e "${RED}❌ Failed to start Docker services - aborting startup${NC}"
    exit 1
}
