#!/usr/bin/env bash
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


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
FRONTEND_DIR="${ROOT_DIR}/frontend"

set -ex

source "${SCRIPT_DIR}/setup_fe.sh"

pushd "${FRONTEND_DIR}"

echo "正在构建前端..."

BUILD_BRANCH=opencoze-local rush rebuild -o @coze-studio/app --verbose

popd

# Copy bundle to backend static directory
echo -e "${YELLOW}正在复制构建产物到后端静态目录...${NC}"
BACKEND_STATIC_DIR="${SCRIPT_DIR}/../backend/static"
BIN_STATIC_DIR="${SCRIPT_DIR}/../bin/resources/static"
FRONTEND_DIST_DIR="${FRONTEND_DIR}/apps/coze-studio/dist"

rm -rf "${BACKEND_STATIC_DIR}"
rm -rf "${BIN_STATIC_DIR}"
mkdir -p "${BACKEND_STATIC_DIR}"
mkdir -p "${BIN_STATIC_DIR}"

# Clear the target directory and copy the new bundle
rm -rf "${BACKEND_STATIC_DIR}"/*
cp -r "${FRONTEND_DIST_DIR}"/* "${BACKEND_STATIC_DIR}/"
cp -r "${FRONTEND_DIST_DIR}"/* "${BIN_STATIC_DIR}/"

echo -e "${GREEN}构建产物复制完成！${NC}"
echo -e "${GREEN}前端文件已复制到: \n ${BACKEND_STATIC_DIR} \n ${BIN_STATIC_DIR} ${NC}"
