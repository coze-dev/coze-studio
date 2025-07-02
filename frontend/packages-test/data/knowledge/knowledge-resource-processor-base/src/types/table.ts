/**
 * 本文件放的是 steps/table 下组件相关的 types
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
