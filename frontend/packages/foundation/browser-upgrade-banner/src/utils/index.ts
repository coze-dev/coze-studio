/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { detect, type Browser } from 'detect-browser';

import { compareVersion } from './compare-version';

type VersionConfig = {
  [K in Browser]?: string;
};

type DownloadConfig = {
  [K in Browser]?: string;
};

const PC_VERSION_CONFIG: VersionConfig = {
  ['chrome']: '87.0.0',
  ['edge-chromium']: '100.0.0',
  ['edge']: '100.0.0',
  ['safari']: '14.0.0',
  ['firefox']: '79.0.0',
  ['ie']: '999999.0.0',
};

// cp-disable-next-line
const CN_CHROME_URL = 'https://www.google.cn/chrome/';
// cp-disable-next-line
const INTERNATIONAL_CHROME_URL = 'https://www.google.com/chrome/';

// cp-disable-next-line
const CN_EDGE_URL = 'https://www.microsoft.com/zh-cn/edge';
// cp-disable-next-line
const INTERNATIONAL_EDGE_URL = 'https://www.microsoft.com/edge';

const CN_BROWSER_DOWNLOAD_CONFIG: DownloadConfig = {
  ['chrome']: CN_CHROME_URL,
  ['edge-chromium']: CN_EDGE_URL,
  ['edge']: CN_EDGE_URL,
  // cp-disable-next-line
  ['safari']: 'https://apps.apple.com/cn/app/safari/id1146562112',
  // cp-disable-next-line
  ['firefox']: 'https://www.mozilla.org/zh-CN/firefox/new/',
  ['ie']: CN_CHROME_URL,
};

const INTERNATIONAL_BROWSER_DOWNLOAD_CONFIG: DownloadConfig = {
  ['chrome']: INTERNATIONAL_CHROME_URL,
  ['edge-chromium']: INTERNATIONAL_EDGE_URL,
  ['edge']: INTERNATIONAL_EDGE_URL,
  // cp-disable-next-line
  ['safari']: 'https://apps.apple.com/app/safari/id1146562112',
  // cp-disable-next-line
  ['firefox']: 'https://www.mozilla.org/firefox/new/',
  ['ie']: INTERNATIONAL_CHROME_URL,
};

/**
 * At present, it seems that the mobile end/PC version is the same without distinction. If it is distinguished later, it will be distinguished by conditions here.
 */
export const testLowVersionBrowse = () => testPCVersion();

const testPCVersion = () => {
  const browserInfo = detect(navigator.userAgent);

  if (!browserInfo) {
    return null;
  }

  const { name, version } = browserInfo;

  // The displayed judgment, incorrectly inferred with the includes type
  if (name === 'bot' || name === 'react-native' || name === 'node') {
    return null;
  }

  const configVersion = PC_VERSION_CONFIG[name];

  if (!configVersion) {
    return null;
  }

  if (compareVersion(version, configVersion) >= 0) {
    return null;
  }

  return {
    downloadUrl: IS_OVERSEA
      ? INTERNATIONAL_BROWSER_DOWNLOAD_CONFIG[name] ?? INTERNATIONAL_CHROME_URL
      : CN_BROWSER_DOWNLOAD_CONFIG[name] ?? CN_CHROME_URL,
  };
};
