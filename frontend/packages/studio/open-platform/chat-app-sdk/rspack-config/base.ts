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

const {
  REGION,
  BUILD_TYPE,
  CUSTOM_VERSION,
  NODE_ENV: ENV,
  ANALYZE_MODE,
  PERFSEE,
  IS_OPEN_SOURCE,
} = process.env;

const NODE_ENV = ENV as 'development' | 'production';
const IS_DEV_MODE = NODE_ENV !== 'production';
const IS_BOE = BUILD_TYPE === 'offline';
const IS_RELEASE_VERSION = CUSTOM_VERSION === 'release';
const IS_OVERSEA = REGION !== 'cn';
const IS_ANALYZE_MODE = ANALYZE_MODE === 'true';
const IS_PERFSEE = PERFSEE === 'true';

export {
  IS_PERFSEE,
  IS_DEV_MODE,
  IS_BOE,
  IS_RELEASE_VERSION,
  IS_OVERSEA,
  CUSTOM_VERSION,
  NODE_ENV,
  REGION,
  IS_ANALYZE_MODE,
  IS_OPEN_SOURCE,
};

type EnvVar = boolean | string;

export const getEnvConfig = (
  config: {
    cn: {
      boe?: EnvVar;
      inhouse?: EnvVar;
      release?: EnvVar;
    };
    sg: {
      inhouse: EnvVar;
      release: EnvVar;
    };
    va: {
      release: EnvVar;
    };
  },
  defaultVal: EnvVar = '',
  // @ts-expect-error -- linter-disable-autofix
): EnvVar => config[REGION]?.[IS_BOE ? 'boe' : CUSTOM_VERSION] ?? defaultVal;
