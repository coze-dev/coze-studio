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

import pkg from '../package.json';

type AssetsType = 'cmaps' | 'pdf.worker';

// Here you need to write the version that bnpm has released.
//
const DEFAULT_VERSION = '0.1.0-alpha.x6e892414ec';

/**
 * This method is used to produce the worker & cmaps link of the unpkg environment. Note that it is not a native method of pdfjs
 */
export const generatePdfAssetsUrl = (assets: AssetsType) => {
  const { name } = pkg;
  let assetsUrl;
  switch (assets) {
    case 'cmaps': {
      assetsUrl = 'lib/cmaps/';
      break;
    }
    case 'pdf.worker': {
      assetsUrl = 'lib/worker.js';
      break;
    }
    default: {
      throw new Error(
        '目前只支持引用 cmaps 与 pdf.worker 文件，如需引用其他文件请联系 @fanwenjie.fe',
      );
    }
  }
  const onlinePkgName = name.replace(/^@/, '');

  const domain =
    REGION === 'cn'
      ? 'lf-cdn.coze.cn/obj/unpkg'
      : 'sf-cdn.coze.com/obj/unpkg-va';

  // cp-disable-next-line
  return `//${domain}/${onlinePkgName}/${DEFAULT_VERSION}/${assetsUrl}`;
};
