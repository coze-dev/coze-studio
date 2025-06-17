#!/bin/bash
set -ex

# Your target branch
TARGET_BRANCH=$targetBranch

if [[ ${SOURCE_BRANCH} =~ ^integration/ || ${SOURCE_BRANCH} =~ ^release/ ]]; then
  # integration -> xxx or release/xxx -> master SKIP check-mr-size.
  echo "::add-message level=info::SKIP check-mr-size"
  exit 0
fi

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
  '**/*.svg'
  'ee/e2e/bot-studio/**'
  'common/changes/**'
  'apps/fornax/**'
  "apps/api-builder/**"
  "packages/api-builder/**"
)

for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_STRING+=":(exclude)$pattern "
done

# Count the number of files changed but exclude certain files and folders
file_changes=$(git diff --name-only "origin/$TARGET_BRANCH..." $EXCLUDE_STRING | wc -l)

# Count the number of line changes but exclude certain files and folders
line_changes=$(git diff --shortstat "origin/$TARGET_BRANCH..." $EXCLUDE_STRING | awk '{print ($4>$6)?$4:$6}')

# Check if number of changed files is greater than 100 or if number of line changes is greater than 2000
if [ "$file_changes" -gt 100 ] || [ "$line_changes" -gt 2000 ]; then
  CONCLUSION="{\"name\": \"MR Size\", \"conclusion\": \"failed\", \"output\":{\"summary\":\"Error: Too many changes. Number of changed files is **""$file_changes""**, number of changed lines is **""$line_changes""**.\n You can contact [@fanwenjie.fe](https://code.byted.org/fanwenjie.fe) to skip this error.\" }}"
else
  CONCLUSION="{\"name\": \"MR Size\", \"conclusion\": \"success\", \"output\":{\"summary\":\"Good\" }}"
fi

echo $CONCLUSION >>check-mr-size.log
echo "::update-check-run::check-mr-size.log"
