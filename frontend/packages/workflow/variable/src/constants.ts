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

import { I18n } from '@coze-arch/i18n';

export const GLOBAL_VARIABLE_SCOPE_ID = 'globalVariableScope';
export const WORKFLOW_VARIABLE_SOURCE = 'block-output_';
export const TRANS_WORKFLOW_VARIABLE_SOURCE = 'block_output_';

export enum GlobalVariableKey {
  System = 'global_variable_system',
  User = 'global_variable_user',
  App = 'global_variable_app',
}

export const allGlobalVariableKeys = [
  GlobalVariableKey.System,
  GlobalVariableKey.User,
  GlobalVariableKey.App,
];

export const GLOBAL_VAR_ALIAS_MAP: Record<string, string> = {
  [GlobalVariableKey.App]: I18n.t('variable_app_name'),
  [GlobalVariableKey.User]: I18n.t('variable_user_name'),
  [GlobalVariableKey.System]: I18n.t('variable_system_name'),
};

export const isGlobalVariableKey = (key: string) =>
  allGlobalVariableKeys.includes(key as GlobalVariableKey);

export const getGlobalVariableAlias = (key = '') =>
  isGlobalVariableKey(key) ? GLOBAL_VAR_ALIAS_MAP[key] : undefined;
