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

export function getEnv(): string {
  if (!IS_PROD) {
    return 'cn-boe';
  }

  const regionPart = IS_OVERSEA ? 'oversea' : 'cn';
  const inhousePart = IS_RELEASE_VERSION ? 'release' : 'inhouse';
  return [regionPart, inhousePart].join('-');
}

// error code
export const ERROR_CODE = {
  SAFE_CHECK: 720092020,
  DUP_NAME_URL: 702093022,
  DUP_NAME: 702092010,
  DUP_PATH: 702093021,
};

export const ACCEPT_FORMAT = ['json', 'yaml'];

export const ACCEPT_EXT = ACCEPT_FORMAT.map(item => `.${item}`);

export const INITIAL_PLUGIN_REPORT_PARAMS = {
  environment: getEnv(),
  workspace_id: '',
  workspace_type: '',
  status: 1,
  create_type: 'import',
};

export const INITIAL_TOOL_REPORT_PARAMS = {
  environment: getEnv(),
  workspace_id: '',
  workspace_type: '',
  status: 1,
  create_type: 'import',
  plugin_id: '',
};
