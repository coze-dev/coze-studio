#!/usr/bin/env bash
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

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$(realpath "$SCRIPT_DIR/..")

if [ "$CUSTOM_SKIP_POST_INSTALL" == "true" ]; then
  exit 0
fi

# pushd $ROOT_DIR/packages/arch/i18n && npm run pull-i18n && popd || exit
node $ROOT_DIR/common/scripts/install-run-rush.js pull-idl -a install || exit
if [ "$NO_STARLING" != true ]; then
  # Update copy
  pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:starling && popd || exit
  pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:starling-cozeloop && popd || exit
fi

if [ "$CI" != "true" ]; then
  node $ROOT_DIR/common/scripts/install-run-rush.js pre-build -o tag:phase-prebuild -v
fi

# if [ -z "$BUILD_TYPE" ]; then
#   #update icon
#   pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:icon && popd || exit
#   pushd $ROOT_DIR/ee/infra/sync-scripts && npm run sync:illustration && popd || exit
# fi
