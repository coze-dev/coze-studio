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

/** update frequency */
export enum FrequencyDay {
  ZERO = 0,
  ONE = 1,
  THREE = 3,
  SEVEN = 7,
  THIRTY = 30,
}
export enum TableSettingFormFields {
  SHEET = 'sheet_id',
  KEY_START_ROW = 'header_line_idx',
  DATA_START_ROW = 'start_line_idx',
}

/** Knowledge base upload file maximum size 100MB */
export const UNIT_MAX_MB = 100;

export const PDF_MAX_PAGES = 500;
