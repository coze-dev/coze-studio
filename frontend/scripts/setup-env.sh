#!/usr/bin/env bash

# Setup common env for CI & SCM
# 1. Ignore installs that do not affect builds
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
export CYPRESS_INSTALL_BINARY=0
export TAIKO_SKIP_CHROMIUM_DOWNLOAD=0
export RE2_DOWNLOAD_SKIP_PATH=1
export RE2_DOWNLOAD_MIRROR="​https://bnpm.bytedance.net/mirrors"

# 2. Effective in the CI environment:
echo ::set-env name=PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD::$PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD
echo ::set-env name=CYPRESS_INSTALL_BINARY::$CYPRESS_INSTALL_BINARY
echo ::set-env name=TAIKO_SKIP_CHROMIUM_DOWNLOAD::$TAIKO_SKIP_CHROMIUM_DOWNLOAD
echo ::set-env name=RE2_DOWNLOAD_SKIP_PATH::$RE2_DOWNLOAD_SKIP_PATH
echo ::set-env name=RE2_DOWNLOAD_MIRROR::$RE2_DOWNLOAD_MIRROR
