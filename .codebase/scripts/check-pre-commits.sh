#!/bin/bash
set -ex

PRE_COMMITS=$1

# 按 codebase 给出的口径，pre commits 超过 5 时容易导致 rebase 失败，因此主动给出警告，避免进入 CQ 后被弹出
if [ $PRE_COMMITS -gt 5 ]; then
  CONCLUSION="{\"name\": \"Pre Commits Check\", \"conclusion\": \"failed\", \"output\":{\"summary\":\"分支已落后目标分支较多，非常容易导致进入 CQ 后被弹出，请执行 rebase/merge 同步代码后重试。\" }}"
else
  CONCLUSION="{\"name\": \"Pre Commits Check\", \"conclusion\": \"success\", \"output\":{\"summary\":\"good\" }}"
fi

echo $CONCLUSION >> check-pre-commits.log
echo "::update-check-run::check-pre-commits.log"
