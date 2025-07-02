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
