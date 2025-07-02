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
