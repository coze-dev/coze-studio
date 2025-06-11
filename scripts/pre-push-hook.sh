#!/bin/bash

# 设置红色颜色的 ANSI 转义码
RED='\033[0;31m'
# 重置颜色的 ANSI 转义码
NC='\033[0m'

CURRENT_USER=$(git config user.email)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_ORIGIN_BRANCH=$(git rev-parse --abbrev-ref @{u})

# if [[ -n "$CURRENT_ORIGIN_BRANCH" ]]; then
#   block_unresolved_conflict "$CURRENT_BRANCH..$CURRENT_ORIGIN_BRANCH"
# fi

if [ "$CURRENT_BRANCH" = "master" ] && [ "$CURRENT_USER" != "ci_flow@bytedance.com" ]; then
  echo "${RED}Do not push to master branch manually!!!${NC}"
  exit 1
fi

if git status --porcelain | grep -q "pnpm-lock.yaml"; then
  echo -e "${RED}Error: pnpm-lock.yaml is included in the changes. Please commit it before push!${NC}"
  exit 1
fi

