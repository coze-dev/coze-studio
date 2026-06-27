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
LOCAL_BUILD_COMPOSE_FILE="$DOCKER_DIR/docker-compose.local-build.yml"
LOCAL_BUILD_DOCKERFILE="$DOCKER_DIR/Dockerfile.coze-server.local"
BUILD_CONTEXT_DIR=""

NO_CACHE=0
FOLLOW_LOGS=0

usage() {
    cat <<'EOF'
Usage: bash scripts/setup/rebuild_coze_server.sh [--no-cache] [--logs]

This script rebuilds only the Go server binary into a lightweight custom
coze-server image based on the existing official runtime image. It is much
faster than rebuilding the full backend image on small servers.

Options:
  --no-cache  Rebuild coze-server without Docker build cache
  --logs      Follow coze-server logs after restart
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
    rm -f "$LOCAL_BUILD_COMPOSE_FILE" "$LOCAL_BUILD_DOCKERFILE"
    if [[ -n "$BUILD_CONTEXT_DIR" && -d "$BUILD_CONTEXT_DIR" ]]; then
        rm -rf "$BUILD_CONTEXT_DIR"
    fi
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
require_file "$BASE_DIR/backend/go.mod"
require_file "$BASE_DIR/backend/go.sum"
require_file "$BASE_DIR/backend/main.go"

# Load optional build proxy settings from docker/.env so compose builds and this
# helper script use the same source of truth.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

GOPROXY_VALUE="${GOPROXY:-https://proxy.golang.org,direct}"
GOSUMDB_VALUE="${GOSUMDB:-sum.golang.org}"
PIP_INDEX_URL_VALUE="${PIP_INDEX_URL:-https://pypi.org/simple}"
DENO_PREWARM_VALUE="${DENO_PREWARM:-true}"

cd "$BASE_DIR"

BRANCH_NAME="$(git branch --show-current 2>/dev/null || echo unknown-branch)"
COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
SAFE_BRANCH_NAME="$(echo "$BRANCH_NAME" | tr '/:@ ' '-')"
LOCAL_IMAGE_TAG="coze-studio-server-local:${SAFE_BRANCH_NAME}-${COMMIT_SHA}"
BUILD_CONTEXT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/coze-server-build.XXXXXX")"

mkdir -p "$BUILD_CONTEXT_DIR/backend"
cp -R "$BASE_DIR/backend/." "$BUILD_CONTEXT_DIR/backend/"

cat > "$LOCAL_BUILD_DOCKERFILE" <<'EOF'
FROM golang:1.24-alpine AS builder

ARG GOPROXY=https://proxy.golang.org,direct
ARG GOSUMDB=sum.golang.org

WORKDIR /app

RUN apk add --no-cache git gcc libc-dev

COPY backend/go.mod backend/go.sum ./
RUN go env -w GOPROXY="$GOPROXY" GOSUMDB="$GOSUMDB" && \
    go mod download

COPY backend/ ./
RUN go build -ldflags="-s -w" -o /app/opencoze main.go

FROM cozedev/coze-studio-server:latest

COPY --from=builder /app/opencoze /app/opencoze
COPY backend/conf /app/resources/conf

CMD ["/app/opencoze"]
EOF

cat > "$LOCAL_BUILD_COMPOSE_FILE" <<EOF
services:
  coze-server:
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
    --build-arg "GOPROXY=$GOPROXY_VALUE"
    --build-arg "GOSUMDB=$GOSUMDB_VALUE"
    -f "$LOCAL_BUILD_DOCKERFILE"
    -t "$LOCAL_IMAGE_TAG"
    "$BUILD_CONTEXT_DIR"
)

if [[ "$NO_CACHE" -eq 1 ]]; then
    BUILD_ARGS=(--no-cache "${BUILD_ARGS[@]}")
fi

echo "Repository: $BASE_DIR"
echo "Branch: $BRANCH_NAME"
echo "Commit: $COMMIT_SHA"
echo "Image: $LOCAL_IMAGE_TAG"
echo "GOPROXY: $GOPROXY_VALUE"
echo "GOSUMDB: $GOSUMDB_VALUE"
echo "PIP_INDEX_URL: $PIP_INDEX_URL_VALUE (ignored by lightweight rebuild)"
echo "DENO_PREWARM: $DENO_PREWARM_VALUE (ignored by lightweight rebuild)"
echo "Build context: $BUILD_CONTEXT_DIR"
echo
echo "Building lightweight coze-server image..."
DOCKER_BUILDKIT=1 docker build "${BUILD_ARGS[@]}"

echo
echo "Recreating coze-server..."
docker compose "${COMPOSE_ARGS[@]}" up -d --no-deps --force-recreate coze-server

echo
echo "Container status:"
docker compose "${COMPOSE_ARGS[@]}" ps coze-server

echo
echo "Recent logs:"
docker logs --tail=80 coze-server || true

echo
echo "HTTP probe:"
curl -I --max-time 10 http://127.0.0.1:8888/ || true

if [[ "$FOLLOW_LOGS" -eq 1 ]]; then
    echo
    echo "Following coze-server logs..."
    docker logs -f coze-server
fi

echo
echo "coze-server rebuild and restart finished"
