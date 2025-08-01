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

import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import { FieldItemType } from '@coze-arch/bot-api/memory';

import { type TestDataRow } from './type';

export const testStructList: TableMemoryItem[] = [
  {
    nanoid: 'id1',
    name: 'city',
    desc: 'city',
    must_required: true,
    type: FieldItemType.Text,
  },
  {
    nanoid: 'id2',
    name: 'level',
    desc: 'level',
    must_required: true,
    type: FieldItemType.Text,
  },
  {
    nanoid: 'id3',
    name: 't_gdp',
    desc: 't_gdp',
    must_required: true,
    type: FieldItemType.Number,
  },
  {
    nanoid: 'id4',
    name: 'p_gdp',
    desc: 'p_gdp',
    must_required: true,
    type: FieldItemType.Float,
  },
  {
    nanoid: 'id7',
    name: 'international_trade_gdp',
    desc: 'p_gdp',
    must_required: true,
    type: FieldItemType.Float,
  },
  {
    nanoid: 'id8',
    name: 'international_trade_p_gdp',
    desc: 'p_gdp',
    must_required: true,
    type: FieldItemType.Float,
  },
  {
    nanoid: 'id5',
    name: 'is_allowed',
    desc: 'is_allowed',
    must_required: true,
    type: FieldItemType.Boolean,
  },
  {
    nanoid: 'id6',
    name: 'update_time',
    desc: 'update_time',
    must_required: true,
    type: FieldItemType.Date,
  },
];

export const testData: TestDataRow[] = [
  [
    {
      field_name: 'city',
      value: '北京',
    },
    {
      field_name: 'level',
      value: '一线',
    },
    {
      field_name: 't_gdp',
      value: 10000,
    },
    {
      field_name: 'p_gdp',
      value: 10000.1,
    },
    {
      field_name: 'is_allowed',
      value: true,
    },
    {
      field_name: 'update_time',
      value: '2023-08-23 12:00:00',
    },
    {
      field_name: 'international_trade_gdp',
      value: 10000,
    },
    {
      field_name: 'international_trade_p_gdp',
      value: 10000.1,
    },
  ],
  [
    {
      field_name: 'city',
      value: '上海',
    },
    {
      field_name: 'level',
      value: '一线',
    },
    {
      field_name: 't_gdp',
      value: 20000,
    },
    {
      field_name: 'p_gdp',
      value: 20000.1,
    },
    {
      field_name: 'is_allowed',
      value: false,
    },
    {
      field_name: 'update_time',
      value: '2023-08-23 12:30:00',
    },
    {
      field_name: 'international_trade_gdp',
      value: 10000,
    },
    {
      field_name: 'international_trade_p_gdp',
      value: 10000.1,
    },
  ],
  [
    {
      field_name: 'city',
      value: '深圳',
    },
    {
      field_name: 'level',
      value: '一线',
    },
    {
      field_name: 't_gdp',
      value: 30000,
    },
    {
      field_name: 'p_gdp',
      value: 30000.1,
    },
    {
      field_name: 'is_allowed',
      value: true,
    },
    {
      field_name: 'update_time',
      value: '2023-08-23 12:20:00',
    },
    {
      field_name: 'international_trade_gdp',
      value: 10000,
    },
    {
      field_name: 'international_trade_p_gdp',
      value: 10000.1,
    },
  ],
  [
    {
      field_name: 'city',
      value: '广州',
    },
    {
      field_name: 'level',
      value: '一线',
    },
    {
      field_name: 't_gdp',
      value: 40000,
    },
    {
      field_name: 'p_gdp',
      value: 40000.1,
    },
    {
      field_name: 'is_allowed',
      value: false,
    },
    {
      field_name: 'update_time',
      value: '2023-08-23 14:00:00',
    },
    {
      field_name: 'international_trade_gdp',
      value: 10000,
    },
    {
      field_name: 'international_trade_p_gdp',
      value: 10000.1,
    },
  ],
];
