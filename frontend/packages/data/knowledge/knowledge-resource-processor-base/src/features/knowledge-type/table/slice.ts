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

import { type StateCreator } from 'zustand';
import {
  CreateUnitStatus,
  type ProgressItem,
  type UnitItem,
} from '@coze-data/knowledge-resource-processor-core';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import type { SemanticValidate, TableInfo, TableSettings } from '@/types';
import { TableStatus, DEFAULT_TABLE_SETTINGS_FROM_ONE } from '@/constants';

import type { UploadTableAction, UploadTableState } from './interface';

export const getDefaultState = () => ({
  /** base store */
  createStatus: CreateUnitStatus.UPLOAD_UNIT,
  progressList: [],
  unitList: [],
  currentStep: 0,
  /** table store */
  status: TableStatus.NORMAL,
  semanticValidate: {},
  tableData: {},
  originTableData: {},
  tableSettings: DEFAULT_TABLE_SETTINGS_FROM_ONE,
  documentList: [],
});

export const createTableSlice: StateCreator<
  UploadTableState<number> & UploadTableAction<number>
> = (set, get) => ({
  /** defaultState */
  ...getDefaultState(),

  /** base store action */
  setCurrentStep: (currentStep: number) => {
    set({ currentStep });
  },
  setCreateStatus: (createStatus: CreateUnitStatus) => {
    set({ createStatus });
  },
  setProgressList: (progressList: ProgressItem[]) => {
    set({ progressList });
  },
  setUnitList: (unitList: UnitItem[]) => {
    set({ unitList });
  },

  /** table store action */
  setStatus: (status: TableStatus) => {
    set({ status });
  },
  setSemanticValidate: (semanticValidate: SemanticValidate) => {
    set({ semanticValidate });
  },
  setTableData: (tableData: TableInfo) => {
    set({ tableData });
  },
  setOriginTableData: (originTableData: TableInfo) => {
    set({ originTableData });
  },
  setTableSettings: (tableSettings: TableSettings) => {
    set({ tableSettings });
  },
  setDocumentList: (documentList: Array<DocumentInfo>) => {
    set({ documentList });
  },

  /** reset state */
  reset: () => {
    set(getDefaultState());
  },
});
