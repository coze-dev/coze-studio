import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import { type FieldItemType } from '@coze-arch/bot-api/memory';

// 期待的数据结构是什么样的？
export interface TableRowCommonData {
  fieldName: string;
  required: boolean;
}

export type TableRowInferData =
  | {
      type: FieldItemType.Boolean;
      value: boolean | string;
    }
  | {
      type: FieldItemType.Date;
      value: string;
    }
  | {
      type: FieldItemType.Float;
      value: string;
    }
  | {
      type: FieldItemType.Number;
      value: number;
    }
  | {
      type: FieldItemType.Text;
      value: string;
    };

export type TableField = TableRowCommonData & TableRowInferData;

export type TableRow = Record<string, TableField>;

export enum RowInternalStatus {
  Normal,
  UnSubmit,
  Error,
}

export enum RowServiceStatus {
  Deleted,
  Normal,
  Shield,
}

export interface TableRowData {
  rowData: TableRow;
  status: RowServiceStatus;
  internalStatus: RowInternalStatus;
}

export type TableList = TableRowData[];

export interface TableFieldData {
  fieldName: string;
  fieldDescription: string;
  required: boolean;
  type: FieldItemType;
}

export interface TableData {
  fieldList: TableFieldData[];
  dataList: TableList;
}

export interface FormatTableDataProps {
  structList: TableMemoryItem[];
  dataRow: Array<Record<string, string>>;
}

export interface TestDataStruct {
  field_name: string;
  value: string | number | boolean;
}

export type TestDataRow = TestDataStruct[];

export interface ChangeDataParams {
  // rowKey: string;
  // fieldName: string;
  // value: string | number | boolean;
  newRowData: TableRow;
}

export interface DeleteDataParams {
  rowKey: string;
}
