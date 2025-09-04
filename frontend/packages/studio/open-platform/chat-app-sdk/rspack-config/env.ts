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

import {
  IS_RELEASE_VERSION,
  IS_DEV_MODE,
  NODE_ENV,
  REGION,
  IS_BOE,
  getEnvConfig,
  IS_OVERSEA,
  IS_OPEN_SOURCE,
} from './base';

export const openSdkDefineEnvs = {
  IS_BOE,
  IS_DEV_MODE,
  REGION: JSON.stringify(REGION),
  IS_RELEASE_VERSION,
  IS_OVERSEA,
  FEATURE_ENABLE_TEA_UG: false,
  IS_PROD: !IS_BOE,
  IS_OPEN_SOURCE,
};

const getUnPkgDirName = () => {
  if (IS_BOE) {
    return 'inhouse/boe';
  }

  let name = '';

  if (IS_RELEASE_VERSION) {
    switch (REGION) {
      case 'sg':
      case 'va':
        name = 'oversea';
        break;
      case 'cn':
        name = 'cn';
        break;
      default:
        name = '';
    }

    return `libs/${name}`;
  }

  return `inhouse/${REGION}`;
};
export const openSdkUnPkgDirName = getUnPkgDirName();

const slardarVaPath = '/maliva';
const slardarSgPath = '/sg';
export const openSdkSlardarRegion = getEnvConfig({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: slardarSgPath,
    release: slardarSgPath,
  },
  va: {
    release: slardarVaPath,
  },
});

console.debug(
  'open-sdk',
  NODE_ENV,
  '\nopenSdkDefineEnvs:',
  openSdkDefineEnvs,
  '\nopenSdkSlardarRegion:',
  openSdkSlardarRegion,
);
