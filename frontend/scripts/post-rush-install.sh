#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$(realpath "$SCRIPT_DIR/..")

if [ "$CUSTOM_SKIP_POST_INSTALL" == "true" ]; then
  exit 0
fi

# pushd $ROOT_DIR/packages/arch/i18n && npm run pull-i18n && popd || exit
node $ROOT_DIR/common/scripts/install-run-rush.js pull-idl -a install || exit
if [ "$NO_STARLING" != true ]; then
  # 更新文案
  pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:starling && popd || exit
  pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:starling-cozeloop && popd || exit
fi

if [ "$CI" != "true" ]; then
  node $ROOT_DIR/common/scripts/install-run-rush.js pre-build -o tag:phase-prebuild -v
fi

# if [ -z "$BUILD_TYPE" ]; then
#   # 更新 icon
#   pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:icon && popd || exit
#   pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:illustration && popd || exit
# fi
