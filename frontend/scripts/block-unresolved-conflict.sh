#!/usr/bash
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


block_unresolved_conflict() {
  set -e
  [ "$CI" = "true" ] && set -x
  # Git conflict marker, typically 7 characters
  local match="<<<<<<<|=======|>>>>>>>"
  local diff_params="$1 --name-status -G $match"
  local count=0

  if [[ $1 == *..* ]]; then
    # Checking whether the branch exists can solve the problem that the feature branch is removed after the merge, resulting in an error in git.
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

  # Only detect modified files
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
