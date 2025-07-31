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


# Set default value
TARGET_BRANCH=${targetBranch}
CI_MODE=${CI:-false}

# Specify the pattern you want to exclude, using *space* as the separator
EXCLUDE_PATTERNS=(
  '**/pnpm-lock.yaml'
  'packages/arch/bot-api/src/auto-generate/**'
  'apps/bot-op/src/services/bam-auto-generate/**'
  'apps/prompt-platform/src/services/auto-generate/**'
  "**/lib/**"
  "**/.*/**"
  '**/__tests__/**'
  '**/__test__/**'
  "**/__mocks__/**"
  "**/__mock__/**"
  "**/*.test.*/**"
  "**/*.spec.*/**"
  "**/__snapshots__/**"
  "**/*.snap"
  '**/e2e/**'
  'common/changes/**'
  'apps/fornax/**',
  "packages/arch/semi-theme-hand01"
)

for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_STRING+=":(exclude)$pattern "
done

if [ "$CI_MODE" = true ]; then
  files=$(git diff --name-only --diff-filter=AM "origin/$TARGET_BRANCH..." $EXCLUDE_STRING)
else
  files=$(git diff --name-only --diff-filter=AM --cached $EXCLUDE_STRING)
fi

# The volume limit is 512KB.
size_limit=$((512))
large_files_info=""

IFS=$'\n' # Handling the existence of spaces in the file name
for file in $files; do
  file_size=$(wc -c <"$file" 2>/dev/null)
  if [ $? -ne 0 ]; then
    echo "错误: 无法获取文件 '$file' 的大小"
    continue
  fi
  file_size_kb=$((file_size / 1024))
  echo "$file file size is $file_size_kb KB"
  if [ "$file_size_kb" -gt "$size_limit" ]; then
    large_files_info+="- \`$file\` ($file_size_kb KB)\n"
  fi
done
unset IFS

output_conclusion() {
  local conclusion="$1"
  echo "$conclusion" >check-file-size.log
  echo "::update-check-run::check-file-size.log"
}

if [ -n "$large_files_info" ]; then
  if [ "$CI_MODE" = true ]; then
    CONCLUSION="{
      \"name\": \"文件体积\",
      \"conclusion\": \"failed\",
      \"output\": {
        \"summary\": \"<h1>错误: 文件体积过大</h1> <br />  以下文件体积超过限制 (${size_limit}KB): \\n \\n $large_files_info  \\n \\n <br /> \"
      }
    }"
    output_conclusion "$CONCLUSION"
  else
    echo "错误: 以下文件体积超过限制 (${size_limit}KB):"
    echo -e "$large_files_info"
    exit 1
  fi
else
  if [ "$CI_MODE" = true ]; then
    CONCLUSION="{
      \"name\": \"文件体积\",
      \"conclusion\": \"success\",
      \"output\": {
        \"summary\": \"GOOD\"
      }
    }"
    output_conclusion "$CONCLUSION"
  fi
fi
