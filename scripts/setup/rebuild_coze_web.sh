#!/bin/bash
#
# Copyright 2025 coze-dev Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"
DOCKER_DIR="$BASE_DIR/docker"
ENV_FILE="$DOCKER_DIR/.env"
BASE_COMPOSE_FILE="$DOCKER_DIR/docker-compose.yml"
MEMORY_COMPOSE_FILE="$DOCKER_DIR/docker-compose.4c4g.yml"
LOCAL_BUILD_COMPOSE_FILE="$DOCKER_DIR/docker-compose.web.local-build.yml"
FRONTEND_DOCKERFILE="$BASE_DIR/frontend/Dockerfile"

NO_CACHE=0
FOLLOW_LOGS=0

usage() {
    cat <<'EOF'
Usage: bash scripts/setup/rebuild_coze_web.sh [--no-cache] [--logs]

This script rebuilds only the frontend web image from the local repository
source and recreates the coze-web container.

Options:
  --no-cache  Rebuild coze-web without Docker build cache
  --logs      Follow coze-web logs after restart
  -h, --help  Show this help message
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --no-cache)
            NO_CACHE=1
            shift
            ;;
        --logs)
            FOLLOW_LOGS=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown argument: $1"
            usage
            exit 1
            ;;
    esac
done

cleanup() {
    rm -f "$LOCAL_BUILD_COMPOSE_FILE"
}

trap cleanup EXIT

require_file() {
    local file_path="$1"
    if [[ ! -f "$file_path" ]]; then
        echo "Missing required file: $file_path"
        exit 1
    fi
}

if ! command -v docker >/dev/null 2>&1; then
    echo "docker command not found"
    exit 1
fi

require_file "$BASE_COMPOSE_FILE"
require_file "$ENV_FILE"
require_file "$FRONTEND_DOCKERFILE"
require_file "$BASE_DIR/rush.json"

if [[ ! -d "$BASE_DIR/frontend" || ! -d "$BASE_DIR/common" || ! -d "$BASE_DIR/scripts" ]]; then
    echo "Missing required frontend build directories under $BASE_DIR"
    exit 1
fi

cd "$BASE_DIR"

BRANCH_NAME="$(git branch --show-current 2>/dev/null || echo unknown-branch)"
COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
SAFE_BRANCH_NAME="$(echo "$BRANCH_NAME" | tr '/:@ ' '-')"
LOCAL_IMAGE_TAG="coze-studio-web-local:${SAFE_BRANCH_NAME}-${COMMIT_SHA}"

cat > "$LOCAL_BUILD_COMPOSE_FILE" <<EOF
services:
  coze-web:
    image: $LOCAL_IMAGE_TAG
EOF

COMPOSE_ARGS=(
    -f "$BASE_COMPOSE_FILE"
)

if [[ -f "$MEMORY_COMPOSE_FILE" ]]; then
    COMPOSE_ARGS+=(-f "$MEMORY_COMPOSE_FILE")
fi

COMPOSE_ARGS+=(
    -f "$LOCAL_BUILD_COMPOSE_FILE"
    --env-file "$ENV_FILE"
)

BUILD_ARGS=(
    --progress=plain
    --build-arg "BUILD_BRANCH=$BRANCH_NAME"
    -f "$FRONTEND_DOCKERFILE"
    -t "$LOCAL_IMAGE_TAG"
    "$BASE_DIR"
)

if [[ "$NO_CACHE" -eq 1 ]]; then
    BUILD_ARGS=(--no-cache "${BUILD_ARGS[@]}")
fi

echo "Repository: $BASE_DIR"
echo "Branch: $BRANCH_NAME"
echo "Commit: $COMMIT_SHA"
echo "Image: $LOCAL_IMAGE_TAG"
echo
echo "Building local coze-web image..."
DOCKER_BUILDKIT=1 docker build "${BUILD_ARGS[@]}"

echo
echo "Recreating coze-web..."
docker compose "${COMPOSE_ARGS[@]}" up -d --no-deps --force-recreate coze-web

echo
echo "Container status:"
docker compose "${COMPOSE_ARGS[@]}" ps coze-web

echo
echo "Image in use:"
docker inspect coze-web --format '{{.Config.Image}}'

echo
echo "Recent logs:"
docker logs --tail=80 coze-web || true

echo
echo "HTTP probe:"
curl -I --max-time 10 http://127.0.0.1:8888/ || true

if [[ "$FOLLOW_LOGS" -eq 1 ]]; then
    echo
    echo "Following coze-web logs..."
    docker logs -f coze-web
fi

echo
echo "coze-web rebuild and restart finished"
