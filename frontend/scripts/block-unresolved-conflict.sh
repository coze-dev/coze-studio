#!/usr/bash

block_unresolved_conflict() {
  set -e
  [ "$CI" = "true" ] && set -x
  # git冲突标记符，一般为7个字符
  local match="<<<<<<<|=======|>>>>>>>"
  local diff_params="$1 --name-status -G $match"
  local count=0

  if [[ $1 == *..* ]]; then
    # 检查分支是否存在，可以解决 merge 之后 feature 分支被 removed ，导致 git 报错的问题。
    sourceBranch=${1%%..*}
    targetBranch=${1#*..}
    if ! git branch -a | grep -qE "$sourceBranch"; then
      echo "branch do not exist: $sourceBranch"
      return 0
    fi
    if ! git branch -a | grep -qE "$targetBranch"; then
      echo "branch do not exist: $targetBranch"
      return 0
    fi
  fi

  # Specify the pattern you want to exclude
  EXCLUDE_PATTERNS=(
    'frontend/scripts/block-unresolved-conflict.sh'
    'frontend/packages/arch/bot-api/src/auto-generate/**'
    'frontend/packages/arch/idl/src/**'
    'common/git-hooks/**'
  )

  for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    exclude_string+=":(exclude)$pattern "
  done

  diff_params+=" $exclude_string"

  # 只检测修改的文件
  conflicts=$(git diff $diff_params | grep '^M' | cut -f 2-)

  if [[ -n "$conflicts" ]]; then
    for conflict in $conflicts; do
      if grep -Eq $match $conflict; then
        echo $conflict
        ((count++))
      fi
    done
    if [[ $count -ne 0 ]]; then
      echo "Unresolved merge conflicts in these files, please check"
      exit 1
    fi
  fi
  return 0
}
