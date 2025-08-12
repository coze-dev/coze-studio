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


# Set the red ANSI escape code
RED='\033[0;31m'
# ANSI escape code to reset color
NC='\033[0m'

CURRENT_USER=$(git config user.email)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_ORIGIN_BRANCH=$(git rev-parse --abbrev-ref @{u})

# Get current origin URL
CURRENT_ORIGIN_URL=$(git remote get-url origin)

# if [[ -n "$CURRENT_ORIGIN_BRANCH" ]]; then
#   block_unresolved_conflict "$CURRENT_BRANCH..$CURRENT_ORIGIN_BRANCH"
# fi

# Check if current origin contains coze-dev/coze-studio
if [[ "$CURRENT_ORIGIN_URL" == *"coze-dev/coze-studio"* ]]; then
  # Block push to main branch for coze-dev/coze-studio repository
  if [ "$CURRENT_BRANCH" = "main" ] && [ "$CURRENT_USER" != "ci_flow@bytedance.com" ]; then
    echo "${RED}Do not push to main branch manually!!!${NC}"
    exit 1
  fi
fi

if git status --porcelain | grep -q "pnpm-lock.yaml"; then
  echo -e "${RED}Error: pnpm-lock.yaml is included in the changes. Please commit it before push!${NC}"
  exit 1
fi

