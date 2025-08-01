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
import { type FileItem } from '@coze-arch/bot-semi/Upload';

import { type SheetInfo } from './datamodel';

export type Callback =
  | (() => Promise<boolean> | boolean)
  | (() => Promise<void> | void);

export enum Step {
  Step1_Upload = 1,
  Step2_TableStructure = 2,
  Step3_TablePreview = 3,
  Step4_Processing = 4,
}

export interface SheetItem {
  id: number;
  sheet_name: string;
  total_row: number;
}

export interface ExcelValue {
  sheetID: number;
  headerRow: number;
  dataStartRow: number;
}

export type Row = Record<number, string>;

export declare namespace StepState {
  export interface Upload {
    fileList?: FileItem[];
  }
  export interface TableStructure {
    excelBasicInfo?: SheetItem[];
    excelValue?: ExcelValue;
    tableValue?: DatabaseInfo;
  }
  export interface TablePreview {
    previewData?: SheetInfo;
  }
  export interface Processing {
    tableID?: string;
  }
}
