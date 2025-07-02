import { type ColumnProps } from '@coze-arch/bot-semi/Table';

export type TableViewValue = string | number | undefined;
export type TableViewRecord = {
  tableViewKey?: string;
} & Record<string, TableViewValue>;
export type TableViewColumns = ColumnProps<TableViewRecord>;

export enum TableViewMode {
  READ = 'read',
  EDIT = 'edit',
}

export enum EditMenuItem {
  EDIT = 'edit',
  DELETE = 'delete',
  DELETEALL = 'deleteAll',
}
export interface ValidatorProps {
  validate?: (
    value: string,
    record?: TableViewRecord,
    index?: number,
  ) => boolean;
  errorMsg?: string;
}
