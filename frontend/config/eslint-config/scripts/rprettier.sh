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

BASE_DIR=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

# Some systems may not have the realpath command.
if ! command -v realpath &>/dev/null; then
    echo "未找到 realpath 命令"
    echo "请执行以下命令安装必要依赖"
    echo "  brew install coreutils"
    exit 1
fi
ROOT_DIR=$(realpath "$BASE_DIR/../")

bash "$ROOT_DIR/node_modules/.bin/prettier" "$@"
