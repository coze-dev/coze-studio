#!/usr/bin/env bash
# 该脚本用与在 scm 内执行 包发布逻辑

source ./scripts/scm_base.sh

# Prepare
prepare_environment

# ignore install
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
export CYPRESS_INSTALL_BINARY=0
export TAIKO_SKIP_CHROMIUM_DOWNLOAD=0
export RE2_DOWNLOAD_SKIP_PATH=1
export RE2_DOWNLOAD_MIRROR=​https://bnpm.bytedance.net/mirrors

# custom_env
export NPM_AUTH_TOKEN=$CUSTOM_NPM_AUTH_TOKEN
export GITLAB_TOKEN=$CUSTOM_GITLAB_TOKEN
export CODEBASE_JWT=$CUSTOM_CODEBASE_JWT
export COZE_HUB_APP_ID=$CUSTOM_COZE_HUB_APP_ID
export COZE_HUB_KEY_ID=$CUSTOM_COZE_HUB_KEY_ID
export COZE_HUB_PRIVATE_KEY=$CUSTOM_COZE_HUB_PRIVATE_KEY

export DEBUG=$CUSTOM_DEBUG
# resolve 400 error https://bytedance.feishu.cn/wiki/wikcnOUP2D6rGipIaN8q7UdzO0e
export CI_NAME=allow_same_version_$BUILD_VERSION
export DEFAULT_BRANCH=$BUILD_REPO_BRANCH
export WEBHOOK_URL=$CUSTOM_WEBHOOK_URL
# publish type example: beta or alpha
PUBLISH_TYPE=$CUSTOM_PUBLISH_TYPE
# use for npm tag
PUBLISH_TAG=$CUSTOM_PUBLISH_TAG
# only beta use for now
PATCH_TAG=$CUSTOM_PATCH_TAG
BY_DIFF=$CUSTOM_BY_DIFF

# to packages
TO_PACKAGES=$CUSTOM_TO_PACKAGES
# from tag
FROM_TAG=$CUSTOM_FROM_TAG
# independent
INDEPENDENT=$CUSTOM_INDEPENDENT

# scm env
BUILD_USER=$BUILD_USER
# version or publiish or tag
MODE=$CUSTOM_MODE
# publish sha
PUBLISH_SHA=$CUSTOM_PUBLISH_SHA
# just list and detch not version
LIST_ONLY=$CUSTOM_LIST_ONLY

initialization() {
  # npm
  npm config set registry https://bnpm.byted.org
  npm config set //bnpm.byted.org/:_authToken $NPM_AUTH_TOKEN
  npm whoami

  # git
  git config user.name ci_flow
  git config user.email ci_flow@bytedance.com
  git remote set-url origin https://bot-studio-monorepo:$GITLAB_TOKEN@code.byted.org/obric/bot-studio-monorepo.git
}

fetch() {
  git fetch --filter=blob:none --unshallow -q
}

initialization

echo "to packages"
echo $TO_PACKAGES

echo "from tag"
echo $FROM_TAG

if [ -n "${PUBLISH_TAG}" ]; then
  PUBLISH_TAG="--tag ${PUBLISH_TAG}"
fi

if [ -n "${PUBLISH_TYPE}" ]; then
  PUBLISH_TYPE="--pre ${PUBLISH_TYPE}"
fi

if [ -n "${WEBHOOK_URL}" ]; then
  WEBHOOK_URL="-w ${WEBHOOK_URL}"
fi

if [ -n "${BUILD_USER}" ]; then
  BUILD_USER="-a ${BUILD_USER}"
fi

echo "安装依赖"
node infra/rush-increment-install/lib/index.js
node common/scripts/install-run-rush.js build -t @coze/cli -v

if [ "$MODE" == "version" -o "$MODE" == "multiple" ]; then
  echo "获取仓库 tags 列表"
  fetch

  echo "计算版本更新列表"
  # Copy output to root dir
  mkdir -p $ROOT_DIR/output
  OUTPUT_COMMAND="node ee/infra/rush-x/bin/run version --list $PUBLISH_TYPE $PUBLISH_TAG $PATCH_TAG $TO_PACKAGES $FROM_TAG $BY_DIFF $INDEPENDENT -b $DEFAULT_BRANCH"
  $OUTPUT_COMMAND >>$ROOT_DIR/output/output.txt

  if [ "$LIST_ONLY" != "true" ]; then

    echo "版本更新列表写入 output.txt"

    echo "执行 version"
    if [ "$MODE" == "multiple" ]; then
      # multiple 模式下只输出 publish 步骤的结果即可
      node ee/infra/rush-x/bin/run version $PUBLISH_TYPE $PUBLISH_TAG $PATCH_TAG $TO_PACKAGES $FROM_TAG $BY_DIFF $INDEPENDENT -b $DEFAULT_BRANCH
    else
      node ee/infra/rush-x/bin/run version $PUBLISH_TYPE $PUBLISH_TAG $PATCH_TAG $TO_PACKAGES $FROM_TAG $BY_DIFF $INDEPENDENT $WEBHOOK_URL $BUILD_USER -b $DEFAULT_BRANCH
    fi
    echo "version 完成"
  fi
fi

if [ "$MODE" == "multiple" ]; then
  PUBLISH_SHA=$(git rev-parse HEAD)
fi

if [ "$MODE" == "publish" -o "$MODE" == "multiple" ]; then
  mkdir -p $ROOT_DIR/output
  echo "Publish sha $PUBLISH_SHA"
  echo "Publish sha $PUBLISH_SHA" >>$ROOT_DIR/output/output.txt

  echo "执行 publish"
  node ee/infra/rush-x/bin/run publish --sha $PUBLISH_SHA $PUBLISH_TAG $WEBHOOK_URL $BUILD_USER
  echo "publish 完成"
fi

# 更新 distTag
if [ "$MODE" == "tag" ]; then
  fetch
  mkdir -p $ROOT_DIR/output
  echo "Publish sha $PUBLISH_SHA"
  echo "Publish sha $PUBLISH_SHA" >>$ROOT_DIR/output/output.txt

  echo "执行 dist tag"
  # 不同模式下点 WEBHOOK_URL 基本不同，需要再传参时注意
  node ee/infra/rush-x/bin/run publish --sha $PUBLISH_SHA $PUBLISH_TAG --dist-tag $WEBHOOK_URL $BUILD_USER
  echo "dist-tag 完成"
fi
