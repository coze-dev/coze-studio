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
 
/**
 * 出自：https://stackoverflow.com/questions/4900436/how-to-detect-the-installed-chrome-version
 */
export const getChromeVersion = () => {
  const pieces = navigator.userAgent.match(
    /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/,
  );
  const MAX_LENGTH = 5;
  if (pieces === null || pieces.length !== MAX_LENGTH) {
    return undefined;
  }

  const [, major, minor, build, patch] = pieces.map(piece =>
    parseInt(piece, 10),
  );
  return {
    major,
    minor,
    build,
    patch,
  };
};

/**
 * 是否支持在column-reverse模式下为负数的scrollTop，chromium最低支持版本83.0.4086.1（上一个版本为82.0.4082.0）
 */
export const supportNegativeScrollTop = () => {
  const chromeVersion = getChromeVersion();

  if (!chromeVersion) {
    /** 假设非chromium系浏览器均支持 */
    return true;
  }

  const { major } = chromeVersion;

  const MAX_MAJOR = 83;
  return major >= MAX_MAJOR;
};
