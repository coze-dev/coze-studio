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

/** table common constants */

export enum TableStatus {
  ERROR = 'error',
  LOADING = 'loading',
  NORMAL = 'normal',
}

export const MAX_TABLE_META_COLUMN_LEN = 50;

export const MAX_TABLE_META_STR_LEN = 30;

/** table-local resegment unit steps */
export enum TableLocalResegmentStep {
  CONFIGURATION,
  PREVIEW,
  PROCESSING,
}

export enum TableSettingFormFields {
  SHEET = 'sheet_id',
  KEY_START_ROW = 'header_line_idx',
  DATA_START_ROW = 'start_line_idx',
}

export const DEFAULT_TABLE_SETTINGS_FROM_ONE = {
  [TableSettingFormFields.SHEET]: 0,
  [TableSettingFormFields.KEY_START_ROW]: 0,
  [TableSettingFormFields.DATA_START_ROW]: 1,
};

export const DEFAULT_TABLE_SETTINGS_FROM_ZERO = {
  [TableSettingFormFields.SHEET]: 0,
  [TableSettingFormFields.KEY_START_ROW]: 0,
  [TableSettingFormFields.DATA_START_ROW]: 0,
};
