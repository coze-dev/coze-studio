#!/bin/bash
set -ex

# 暂时只扫描 app-botstudio-main 项目的产物
result=$(argus scm -c apps/bot/dist_sg/static -n obric/cloud/bot_studio_oversea -l)

if echo "$result" | grep -q '::add-message level=error:::'; then
  if [ "$CI" ]; then
    echo '::add-message level=info::本地验证命令:`npm install -g @ies/argus-scan@0.30.37 && REGION=sg CUSTOM_VERSION=release rush build -o app-botstudio-main && argus scm -c apps/bot/dist_sg/static -n obric/cloud/bot_studio_oversea -l`'
  fi
  exit 1
else
  exit 0
fi
