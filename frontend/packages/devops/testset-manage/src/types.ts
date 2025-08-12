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

import { type ReactNode } from 'react';

import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import {
  type CaseDataDetail,
  type CaseDataBase,
} from '@coze-arch/bot-api/debugger_api';

export type TestsetData = CaseDataDetail;
export type TestsetDatabase = CaseDataBase;

export enum FormItemSchemaType {
  STRING = 'string',
  BOT = 'bot',
  NUMBER = 'number',
  OBJECT = 'object',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
  FLOAT = 'float',
  LIST = 'list',
}

export interface ArrayFieldSchema {
  type: string;
}

export type ObjectFieldSchema = {
  name: string;
  type: string;
  schema?: ArrayFieldSchema | ObjectFieldSchema;
}[];

export interface FormItemSchema {
  // Expand to enumeration
  type: string;
  name: string;
  description?: string;
  required?: boolean;
  value?: string | number | boolean;
  /** Object/array complex types have schema definitions */
  schema?: ArrayFieldSchema | ObjectFieldSchema;
}

export interface NodeFormSchema {
  component_id: string;
  component_type: number;
  component_name: string;
  component_icon?: string;
  inputs: FormItemSchema[];
}

export interface NodeFormItem {
  (props: CommonFieldProps): ReactNode;
}
