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

import { nanoid } from 'nanoid';
import {
  type DatabaseInfo,
  type TableMemoryItem,
} from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { FieldItemType, BotTableRWMode } from '@coze-arch/bot-api/memory';

import { type ReadAndWriteModeOptions } from '../types/database-field';

export const FIELD_TYPE_OPTIONS = [
  { value: FieldItemType.Text, label: I18n.t('db_add_table_field_type_txt') },
  { value: FieldItemType.Number, label: I18n.t('db_add_table_field_type_int') },
  { value: FieldItemType.Date, label: I18n.t('db_add_table_field_type_time') },
  {
    value: FieldItemType.Float,
    label: I18n.t('db_add_table_field_type_number'),
  },
  {
    value: FieldItemType.Boolean,
    label: I18n.t('db_add_table_field_type_bool'),
  },
];

export const TEMPLATE_INFO: DatabaseInfo = {
  name: 'book_notes',
  desc: I18n.t('db_add_table_temp_desc'),
  tableId: '',
  readAndWriteMode: BotTableRWMode.LimitedReadWrite,
  tableMemoryList: [
    {
      nanoid: nanoid(),
      name: 'name',
      desc: I18n.t('db_add_table_temp_field_desc1'),
      type: FieldItemType.Text,
      must_required: true,
    },
    {
      name: 'section',
      nanoid: nanoid(),
      desc: I18n.t('db_add_table_temp_field_desc2'),
      type: FieldItemType.Number,
      must_required: false,
    },
    {
      name: 'note',
      nanoid: nanoid(),
      desc: I18n.t('db_add_table_temp_field_desc3'),
      type: FieldItemType.Text,
      must_required: false,
    },
  ],
};

export const RW_MODE_OPTIONS_CONFIG: Record<
  BotTableRWMode,
  { tips: string; label: string }
> = {
  [BotTableRWMode.LimitedReadWrite]: {
    tips: I18n.t('db_table_0129_005'),
    label: I18n.t('db_table_0129_002'),
  },
  [BotTableRWMode.ReadOnly]: {
    tips: I18n.t('db_table_0129_006'),
    label: I18n.t('db_table_0129_003'),
  },
  [BotTableRWMode.UnlimitedReadWrite]: {
    tips: I18n.t('db_table_0129_007'),
    label: I18n.t('db_table_0129_004'),
  },
  [BotTableRWMode.RWModeMax]: {
    tips: '',
    label: '',
  },
};

export const RW_MODE_OPTIONS_MAP: Record<
  ReadAndWriteModeOptions,
  BotTableRWMode[]
> = {
  excel: [BotTableRWMode.LimitedReadWrite],
  normal: [BotTableRWMode.LimitedReadWrite],
  expert: [BotTableRWMode.LimitedReadWrite, BotTableRWMode.UnlimitedReadWrite],
};

export const DATABASE_CONTENT_CHECK_ERROR_CODE = 708024072;
export const DATABASE_CONTENT_CHECK_ERROR_CODE_NEW = 708334072;

/**
 * Built-in field: uuid
 * bstudio_connector_uid
 */
export const USER_ID_FIELD: TableMemoryItem = {
  name: 'uuid',
  desc: I18n.t('workflow_240221_01'),
  type: FieldItemType.Text,
  must_required: true,
  nanoid: nanoid(),
  isSystemField: true,
};

/**
 * Built-in field: id
 */
export const ID_FIELD: TableMemoryItem = {
  name: 'id',
  desc: I18n.t('database_240520_01'),
  type: FieldItemType.Number,
  must_required: true,
  nanoid: nanoid(),
  isSystemField: true,
};

/**
 * Built-in fields: sys_platform
 * bstudio_connector_id
 */
export const PLATFORM_FIELD: TableMemoryItem = {
  name: 'sys_platform',
  desc: I18n.t('db_optimize_002'),
  type: FieldItemType.Text,
  must_required: true,
  nanoid: nanoid(),
  isSystemField: true,
};

/**
 * Built-in fields: connector_id
 * bstudio_create_time
 */
export const CREATE_TIME_FIELD: TableMemoryItem = {
  name: 'bstudio_create_time',
  desc: I18n.t('db_optimize_003'),
  type: FieldItemType.Date,
  must_required: true,
  nanoid: nanoid(),
  isSystemField: true,
};

/**
 * Built-in system fields
 */
export const SYSTEM_FIELDS = [
  ID_FIELD,
  PLATFORM_FIELD,
  USER_ID_FIELD,
  CREATE_TIME_FIELD,
];

export const SYSTEM_FIELD_ROW_INDEX: Record<string, string | undefined> = {
  id: 'bstudio_id',
  sys_platform: 'bstudio_connector_id',
  uuid: 'bstudio_connector_uid',
  bstudio_create_time: 'bstudio_create_time',
};
