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

import {
  type UploadBaseAction,
  type UploadBaseState,
} from '@coze-data/knowledge-resource-processor-core';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import type { SemanticValidate, TableSettings, TableInfo } from '@/types';
import { type TableStatus } from '@/constants';

export interface UploadTableAction<T extends number>
  extends UploadBaseAction<T> {
  /** store action */
  setStatus: (status: TableStatus) => void;
  setSemanticValidate: (semanticValidate: SemanticValidate) => void;
  setTableData: (tableData: TableInfo) => void;
  setOriginTableData: (originTableData: TableInfo) => void;
  setTableSettings: (tableSettings: TableSettings) => void;
  setDocumentList?: (documentList: Array<DocumentInfo>) => void;
}

export interface UploadTableState<T extends number> extends UploadBaseState<T> {
  status: TableStatus;
  semanticValidate: SemanticValidate;
  tableData: TableInfo;
  originTableData: TableInfo;
  tableSettings: TableSettings;
  documentList?: Array<DocumentInfo>;
}
