#!/bin/bash
set -ex

SOURCE_BRANCH=${SOURCE_BRANCH}
TARGET_BRANCH=${targetBranch}

if [[ $TARGET_BRANCH == "master" && !($SOURCE_BRANCH =~ ^release/ || $SOURCE_BRANCH =~ ^hotfix/ || $SOURCE_BRANCH =~ ^task/ || $SOURCE_BRANCH =~ ^fix/) ]]; then
  # 检查$SOURCE_BRANCH是否以'release/'或'hotfix/'或'task/'或'fix/'开头
  LATEST_BRANCH="release/$(date -d '+8 hour' +%Y%m%d)"
  CONCLUSION="{\"name\": \"Target Branch\", \"conclusion\": \"failed\", \"output\":{\"summary\":\"Error: Please don't merge to master directly, use [$LATEST_BRANCH](https://code.byted.org/obric/bot-studio-monorepo/commits/$LATEST_BRANCH) instead.\n You can contact [@fanwenjie.fe](https://code.byted.org/fanwenjie.fe) to skip this error.\" }}"
else
  CONCLUSION="{\"name\": \"Target Branch\", \"conclusion\": \"success\", \"output\":{\"summary\":\"Good Pratice\" }}"
fi

echo $CONCLUSION >>check-merge-target.log
echo "::update-check-run::check-merge-target.log"
