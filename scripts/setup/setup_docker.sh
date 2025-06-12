#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../../docker" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ ! -d "$DOCKER_DIR" ]; then
    echo -e "${RED}❌ Directory not found: $DOCKER_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}🐳 Starting Docker services...${NC}"
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$BACKEND_DIR/.env" up -d --wait || {
    echo -e "${RED}❌ Failed to start Docker services - aborting startup${NC}"
    exit 1
}
