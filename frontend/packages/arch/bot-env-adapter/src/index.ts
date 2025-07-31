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

import { features } from './features';
import { configs } from './configs';
import { base } from './base';

const envs = {
  ...base,
  ...configs,
  ...features,
};

const COMMON_NULLABLE_VARS = ['CUSTOM_ENV_NAME', 'OUTER_CDN'];
const NULLABLE_VARS =
  envs.BUILD_TYPE === 'local'
    ? ['CDN', ...COMMON_NULLABLE_VARS]
    : [...COMMON_NULLABLE_VARS];

if (process.env.VERBOSE === 'true') {
  console.info(JSON.stringify(envs, null, 2));
}
const emptyVars = Object.entries({
  ...base,
  ...features,
}).filter(
  ([key, value]) => value === undefined && !NULLABLE_VARS.includes(key),
);

if (emptyVars.length) {
  throw Error(`以下环境变量值为空：${emptyVars.join('、')}`);
}

export { envs as GLOBAL_ENVS };
