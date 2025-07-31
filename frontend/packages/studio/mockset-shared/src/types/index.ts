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

import { type MockRule } from '@coze-arch/bot-api/debugger_api';

export enum MockDataValueType {
  STRING = 'string',
  INTEGER = 'integer',
  NUMBER = 'number',
  OBJECT = 'object',
  ARRAY = 'array',
  BOOLEAN = 'boolean',
}

export enum MockDataStatus {
  DEFAULT = 'default',
  REMOVED = 'removed',
  ADDED = 'added',
}

export interface MockDataWithStatus {
  /** key */
  key: string;
  /**  field name */
  label: string;
  /**  field value */
  realValue?: string | number | boolean;
  /**  display use */
  displayValue?: string;
  /**  describe */
  description?: string;
  /**  Is it required? */
  isRequired: boolean;
  /**  field data type */
  type: MockDataValueType;
  /**  for array */
  childrenType?: MockDataValueType;
  /**  Field Status */
  status: MockDataStatus;
  /**  Field sub-node */
  children?: MockDataWithStatus[];
}

export interface MockDataInfo {
  schema?: string;
  mock?: MockRule;
  mergedResultExample?: string;
  incompatible?: boolean;
}
