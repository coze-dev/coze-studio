#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${1:-${SCRIPT_DIR}/../frontend}"

pushd "${FRONTEND_DIR}/apps/coze-studio"
echo -e "Entering frontend build output directory: ${FRONTEND_DIR}/apps/coze-studio"


# Check if dist directory exists and is not empty
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
  echo -e "dist directory does not exist or is empty, initializing environment..."
  bash ${SCRIPT_DIR}/setup_fe.sh
else
  echo "dist directory exists and is not empty, skipping environment initialization"
fi
popd

echo -e "Starting backend service..."
make web

echo -e "Starting frontend service..."
pushd "${FRONTEND_DIR}/apps/coze-studio"
WEB_SERVER_PORT=8888 npm run dev
popd