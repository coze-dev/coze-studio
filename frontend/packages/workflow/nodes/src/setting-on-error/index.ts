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

export {
  SettingOnErrorProcessType,
  type SettingOnErrorExt,
  type SettingOnErrorVO,
  type SettingOnErrorValue,
} from './types';

export {
  settingOnErrorInit,
  settingOnErrorSave,
  settingOnErrorToDTO,
  settingOnErrorToVO,
} from './data-transformer';
export {
  isSettingOnError,
  isSettingOnErrorV2,
  isSettingOnErrorDynamicPort,
} from './utils';
export {
  generateErrorBodyMeta,
  generateIsSuccessMeta,
} from './utils/generate-meta';
export {
  useIsSettingOnError,
  useIsSettingOnErrorV2,
  useTimeoutConfig,
} from './hooks';
export {
  SETTING_ON_ERROR_PORT,
  SETTING_ON_ERROR_NODES_CONFIG,
  ERROR_BODY_NAME,
  IS_SUCCESS_NAME,
} from './constants';
export {
  getOutputsWithErrorBody,
  sortErrorBody,
  getExcludeErrorBody,
} from './utils/outputs';
