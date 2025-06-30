import { type TableViewRecord } from '@coze-common/table-view';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';
import { type SliceInfo } from '@coze-arch/bot-api/knowledge';

export type ISliceInfo = SliceInfo & { addId?: string; id?: string };

export interface TranSliceListParams {
  sliceList: ISliceInfo[];
  metaData?: DocTableColumn[];
  canEdit: boolean;
  tableKey: string;
  onEdit?: (record, index: number) => void;
  onDelete?: (indexs: number[]) => void;
  onUpdate?: (record: TableViewRecord, index: number, value?: string) => void;
}

/** 切片插入的位置 */
export type TPosition = 'top' | 'bottom';
