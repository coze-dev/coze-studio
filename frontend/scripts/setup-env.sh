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


# Setup common env for CI & SCM
# 1. Ignore installs that do not affect builds
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
export CYPRESS_INSTALL_BINARY=0
export TAIKO_SKIP_CHROMIUM_DOWNLOAD=0
export RE2_DOWNLOAD_SKIP_PATH=1

# 2. Effective in the CI environment:
echo ::set-env name=PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD::$PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD
echo ::set-env name=CYPRESS_INSTALL_BINARY::$CYPRESS_INSTALL_BINARY
echo ::set-env name=TAIKO_SKIP_CHROMIUM_DOWNLOAD::$TAIKO_SKIP_CHROMIUM_DOWNLOAD
echo ::set-env name=RE2_DOWNLOAD_SKIP_PATH::$RE2_DOWNLOAD_SKIP_PATH
echo ::set-env name=RE2_DOWNLOAD_MIRROR::$RE2_DOWNLOAD_MIRROR
