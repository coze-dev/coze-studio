import { type TableViewRecord } from '@coze-common/table-view';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';
import { type SliceInfo } from '@coze-arch/bot-api/knowledge';

export type ISliceInfo = SliceInfo & { addId?: string; id?: string };

export interface TranSliceListParams {
  sliceList: ISliceInfo[];
  metaData?: DocTableColumn[];
  handleEdit: (record, index: number) => void;
  handleDelete: (indexs: number[]) => void;
  update: (record: TableViewRecord, index: number, value?: string) => void;
  canEdit: boolean;
  tableKey: string;
}

/** 切片插入的位置 */
export type TPosition = 'top' | 'bottom';
