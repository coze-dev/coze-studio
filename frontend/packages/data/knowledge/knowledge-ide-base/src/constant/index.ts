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
import { DocumentUpdateType, FormatType } from '@coze-arch/bot-api/memory';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';

export const MAX_SEGMENT_TOTAL = 10000;
export const CREATE_UNIT_DISABLE_UNIT_TYPES = [
  UnitType.TABLE_GOOGLE_DRIVE,
  UnitType.TABLE_FEISHU,
  UnitType.TEXT_FEISHU,
  UnitType.TEXT_LARK,
  UnitType.TABLE_LARK,
  UnitType.TEXT_GOOGLE_DRIVE,
  UnitType.TEXT_DOC,
  UnitType.TEXT_URL,
  UnitType.TEXT_NOTION,
  UnitType.TEXT_CUSTOM,
];
export const CREATE_UNIT_DISABLE_FORMAT_TYPES = [FormatType.Text];
export enum ViewMode {
  ContentView,
  SegmentView,
}

export const VIEW_MODE_OPTIONS = [
  {
    value: ViewMode.ContentView,
    label: I18n.t('content_view_001'),
  },
  {
    value: ViewMode.SegmentView,
    label: I18n.t('content_view_002'),
  },
];
export enum SegmentOptSelect {
  RENAME = 0,
  UPDATE_CONTENT = 1,
  UPDATE_FREQUENCY = 2,
  DELETE = 4,
  CONFIGURATION_TABLE_STRUCTURE = 5,
  FETCH_SLICE = 6,
  UPDATE_FREQUENCY_BATCH = 7,
  APPEND_FREQUENCY = 8,
  OPEN_SEARCH_CONFIG = 9,
}

export const DOCUMENT_UPDATE_TYPE_MAP = {
  [DocumentUpdateType.NoUpdate]: I18n.t('datasets_segment_tag_updateNo'),
  [DocumentUpdateType.Cover]: I18n.t('datasets_segment_tag_overwrite'),
  [DocumentUpdateType.Append]: I18n.t('datasets_segment_tag_overwriteNo'),
} as const;

export { POLLING_TIME } from './polling';
