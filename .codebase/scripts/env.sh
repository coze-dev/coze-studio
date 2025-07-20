#!/usr/bin/env bash

echo ::set-env name=no_proxy::cn.goofy.app,.cn.goofy.app,goofy.app,.goofy.app,localhost,.byted.org,byted.org,.bytedance.net,bytedance.net,127.0.0.1,127.0.0.0/8,169.254.0.0/16,100.64.0.0/10,172.16.0.0/12,192.168.0.0/16,10.0.0.0/8,::1,fe80::/10,fd00::/8
echo ::set-env name=all_proxy::http://sys-proxy-rd-relay.byted.org:3128
echo ::set-env name=http_proxy::http://sys-proxy-rd-relay.byted.org:3128
echo ::set-env name=https_proxy::http://sys-proxy-rd-relay.byted.org:3128

#!/usr/bin/env bash

# Setup common env for CI & SCM
# 1. 忽略不影响构建的 install
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
export CYPRESS_INSTALL_BINARY=0
export TAIKO_SKIP_CHROMIUM_DOWNLOAD=0
export CUSTOM_VERSION="inhouse"
export RE2_DOWNLOAD_SKIP_PATH=1
export RE2_DOWNLOAD_MIRROR="​https://bnpm.bytedance.net/mirrors"
export PUPPETEER_SKIP_DOWNLOAD=true

# 2. 在 CI 环境生效：
echo ::set-env name=PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD::$PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD
echo ::set-env name=CYPRESS_INSTALL_BINARY::$CYPRESS_INSTALL_BINARY
echo ::set-env name=TAIKO_SKIP_CHROMIUM_DOWNLOAD::$TAIKO_SKIP_CHROMIUM_DOWNLOAD
echo ::set-env name=RE2_DOWNLOAD_SKIP_PATH::$RE2_DOWNLOAD_SKIP_PATH
echo ::set-env name=RE2_DOWNLOAD_MIRROR::$RE2_DOWNLOAD_MIRROR
echo ::set-env name=PUPPETEER_SKIP_DOWNLOAD::$PUPPETEER_SKIP_DOWNLOAD
