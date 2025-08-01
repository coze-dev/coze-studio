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

/**
 * This file contains the types related to the components under steps/table
 */
import type {
  DocTableColumn,
  GetDocumentTableInfoResponse,
  Int64,
  common,
} from '@coze-arch/bot-api/memory';

import { type TableSettingFormFields } from '../constants';

type SheetId = string | number;
type Sequence = string | number;

export type SemanticValidate = Record<SheetId, SemanticValidateItem>;

export type SemanticValidateItem = Record<Sequence, SemanticValidateRes>;

export interface SemanticValidateRes {
  valid: boolean;
  msg: string;
}

export type AddCustomTableMeta = Array<
  Pick<
    DocTableColumn,
    'column_name' | 'column_type' | 'desc' | 'is_semantic' | 'id'
  > & {
    autofocus?: boolean;
    key?: string;
  }
>;

export interface TableItem extends common.DocTableColumn {
  key?: string;
  is_new_column?: boolean;
  autofocus?: boolean;
}

export interface TableInfo {
  sheet_list?: GetDocumentTableInfoResponse['sheet_list'];
  preview_data?: GetDocumentTableInfoResponse['preview_data'];
  table_meta?: Record<Int64, Array<TableItem>>;
}

export interface TableSettings {
  [TableSettingFormFields.SHEET]: number;
  [TableSettingFormFields.KEY_START_ROW]: number;
  [TableSettingFormFields.DATA_START_ROW]: number;
}

export interface ResegmentFetchTableInfoReq {
  document_id: string;
}
export interface LocalFetchTableInfoReq {
  tos_uri: string;
}
export interface APIFetchTableInfoReq {
  web_id: string;
}

export interface CustomFormFields {
  unitName: string;
  metaData: AddCustomTableMeta;
}
