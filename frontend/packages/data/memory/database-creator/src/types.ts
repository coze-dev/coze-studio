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

import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import {
  type AlterBotTableResponse,
  type InsertBotTableResponse,
} from '@coze-arch/bot-api/memory';

export type OnSave = (params: {
  response: InsertBotTableResponse | AlterBotTableResponse;
}) => Promise<void>;

export enum CreateType {
  custom = 'custom',
  template = 'template',
  excel = 'excel',
  // recommended table
  recommend = 'recommend',
  // Enter natural language to build a table
  naturalLanguage = 'naturalLanguage',
}

export interface MapperItem {
  label: string;
  key: string;
  validator: {
    type: VerifyType;
    message: string;
  }[];
  defaultValue: any;
  require: boolean;
}

export type TableBasicInfo = Pick<
  DatabaseInfo,
  'name' | 'desc' | 'readAndWriteMode'
> & { prompt_disabled: boolean };
export type TableFieldsInfo = DatabaseInfo['tableMemoryList'];

export enum VerifyType {
  Required = 1,
  Unique = 2,
  Naming = 3,
}

export type TriggerType = 'blur' | 'change' | 'save';

export interface NL2DBInfo {
  prompt: string;
}

export type ReadAndWriteModeOptions = 'excel' | 'normal' | 'expert';
