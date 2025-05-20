#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$BASE_DIR/backend"
DOCKER_DIR="$BASE_DIR/docker"
BIN_DIR="$BASE_DIR/bin"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 BASE_DIR: $BASE_DIR${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

"${SCRIPT_DIR}"/tearup/setup_docker.sh || {
    echo -e "${RED}❌ setup_docker.sh failed${NC}"
    exit 1
}
"${SCRIPT_DIR}"/tearup/setup_mysql.sh "$@" || {
    echo -e "${RED}❌ setup_mysql.sh failed${NC}"
    exit 1
}
"${SCRIPT_DIR}"/tearup/setup_es.sh || {
    echo -e "${RED}❌ setup_es.sh failed${NC}"
    exit 1
}
"${SCRIPT_DIR}"/tearup/setup_minio.sh || {
    echo -e "${RED}❌ setup_minio.sh failed${NC}"
    exit 1
}

"${SCRIPT_DIR}"/build_server.sh -start || {
    echo -e "${RED}❌ build_server.sh failed${NC}"
    exit 1
}
