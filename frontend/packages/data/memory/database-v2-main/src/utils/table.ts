import { type ColumnProps } from '@coze/coze-design';

import { type TableRow } from '../components/database-table-data/type';

const FIXED_COLUMN_WIDTH = 60;
const MIN_COLUMN_WIDTH = 100;
/**
 * 表格列伸缩时的回调，用于限制伸缩边界
 * @param column
 * @returns
 */
export const resizeFn = (
  column: ColumnProps<TableRow>,
): ColumnProps<TableRow> => {
  // 多选框/序号列不可伸缩
  if (column.key === 'column-selection') {
    return {
      ...column,
      resizable: false,
      width: FIXED_COLUMN_WIDTH,
    };
  }
  // 固定列（操作列）不可伸缩
  if (column.fixed) {
    return {
      ...column,
      resizable: false,
    };
  }
  // 其余字段列可伸缩，但需要限制最小宽度
  return {
    ...column,
    width:
      Number(column.width) < MIN_COLUMN_WIDTH
        ? MIN_COLUMN_WIDTH
        : Number(column.width),
  };
};
