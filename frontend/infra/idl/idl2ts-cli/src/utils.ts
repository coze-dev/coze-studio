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

import path from 'path';

import { type ApiConfig } from './types';

export function lookupConfig<T = ApiConfig>(
  projectRoot: string,
  configName = 'api.config',
) {
  const apiConfigPath = path.resolve(process.cwd(), projectRoot, configName);
  try {
    require.resolve(apiConfigPath);
  } catch (error) {
    throw Error(`Can not find api config in path ${process.cwd()}`);
  }
  // eslint-disable-next-line security/detect-non-literal-require, @typescript-eslint/no-require-imports
  return require(apiConfigPath) as T[];
}
