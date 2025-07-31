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

const { NODE_ENV } = process.env;

const IS_DEV_MODE = NODE_ENV === 'development'; // local environment
const IS_PRODUCT_MODE = NODE_ENV === 'production'; // production environment

const IS_CI = process.env.CI === 'true';

const IS_SCM = !!process.env.BUILD_PATH_SCM;

export const envs = {
  IS_DEV_MODE,
  IS_PRODUCT_MODE,
  IS_CI,
  IS_SCM,
};

const emptyVars = Object.entries({
  ...envs,
}).filter(([key, value]) => value === undefined);

if (emptyVars.length) {
  throw Error(`以下环境变量值为空：${emptyVars.join('、')}`);
}
