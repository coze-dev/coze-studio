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

import { getCurrentBranch } from './utils/current-branch';

const processEnvs = {
  BUILD_TYPE: (process.env.BUILD_TYPE || 'local') as
    | 'online'
    | 'offline'
    | 'test'
    | 'local',
  CUSTOM_VERSION: (process.env.CUSTOM_VERSION || 'inhouse') as
    | 'release'
    | 'inhouse',
  BUILD_BRANCH: (process.env.BUILD_BRANCH || getCurrentBranch()) as string,
  REGION: (process.env.REGION || 'cn') as 'cn' | 'sg' | 'va',
  NODE_ENV: process.env.NODE_ENV as 'production' | 'development' | 'test',
  CDN_PATH_PREFIX: (process.env.CDN_PATH_PREFIX ?? '/') as string,
  // Used by vmok producers to upload the producer's sourcemap file to the corresponding consumer version
  CONSUMER_BUILD_VERSION: (process.env.CONSUMER_BUILD_VERSION ?? '') as string,
};

const IS_OVERSEA = Boolean(process.env.REGION) && process.env.REGION !== 'cn';
const IS_CN_REGION = process.env.REGION === 'cn';
const IS_VA_REGION = process.env.REGION === 'va';
const IS_RELEASE_VERSION = processEnvs.CUSTOM_VERSION === 'release'; // Show external version for ture
const IS_OVERSEA_RELEASE = IS_OVERSEA && IS_RELEASE_VERSION;
const IS_PROD =
  processEnvs.BUILD_TYPE === 'online' ||
  process.env.CUSTOM_BUILD_TYPE === 'online'; // Is it online?
const IS_BOE = processEnvs.BUILD_TYPE === 'offline';
const IS_DEV_MODE = processEnvs.NODE_ENV === 'development'; // local development
const IS_BOT_OP = false; // Whether it is a bot operation platform, the default is false, and the build from the operation platform will be set to true.
const IS_OPEN_SOURCE = (process.env.IS_OPEN_SOURCE ?? 'false') === 'true';

const judgements = {
  IS_OVERSEA,
  IS_CN_REGION,
  IS_VA_REGION,
  IS_BOE,
  IS_RELEASE_VERSION,
  IS_OVERSEA_RELEASE,
  IS_DEV_MODE,
  IS_PROD,
  IS_BOT_OP,
  IS_OPEN_SOURCE,
};

const getInnerCDN = () =>
  process.env[`CDN_INNER_${processEnvs.REGION.toUpperCase()}`];

const getOuterCDN = () =>
  process.env[`CDN_OUTER_${processEnvs.REGION.toUpperCase()}`];

const getCDN = () => {
  if (IS_DEV_MODE) {
    if (IS_RELEASE_VERSION) {
      return '';
    } else {
      return '';
    }
  }
  if (IS_RELEASE_VERSION && processEnvs.BUILD_TYPE === 'online') {
    // Overseas official version uses independent business lines
    return getOuterCDN();
  } else {
    return getInnerCDN();
  }
};

/** Corresponding to the CDN address on the CDN resource upload platform */
const getUploadCDN = () => {
  const uploadCDNPrefixes = {
    UPLOAD_CDN_CN: '',
    UPLOAD_CDN_SG: '',
    UPLOAD_CDN_VA: '',
  };

  const currentKey = `UPLOAD_CDN_${processEnvs.REGION.toUpperCase() as string}`;

  return {
    UPLOAD_CDN: uploadCDNPrefixes[currentKey as keyof typeof uploadCDNPrefixes],
    ...(IS_DEV_MODE ? uploadCDNPrefixes : {}),
  };
};

export const base = {
  ...processEnvs,
  ...judgements,
  CDN: getCDN(),
  // External static domain name in the release environment
  OUTER_CDN: getOuterCDN(),
  ...getUploadCDN(),
};
