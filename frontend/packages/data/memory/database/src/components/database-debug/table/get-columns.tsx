import { get } from 'lodash-es';
import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import { colWidthCacheService } from '@coze-common/table-view';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { Typography } from '@coze-arch/bot-semi';
import { FieldItemType } from '@coze-arch/bot-api/memory';

import styles from './index.module.less';

const { Text } = Typography;

const DEFAULT_WIDTH = 120;
export const MAX_WIDTH = 855;

const getTitle = (name: string, mustRequired: boolean) => (
  <div className="flex items-center">
    <Text
      ellipsis={{
        showTooltip: {
          opts: { content: name },
        },
      }}
    >
      {name}
    </Text>
    {mustRequired ? (
      <span style={{ color: 'red', height: '16px' }}>*</span>
    ) : null}
  </div>
);
/* eslint-disable complexity */
export const getColumns = (
  _list: TableMemoryItem[],
  tableId: string,
): { list: ColumnProps[]; width: number } => {
  const cacheWidthMap = colWidthCacheService?.getTableWidthMap(tableId) ?? {};
  const initWidth =
    MAX_WIDTH / _list.length > DEFAULT_WIDTH
      ? MAX_WIDTH / _list.length
      : DEFAULT_WIDTH;
  const list: ColumnProps[] = _list.map((i, index) => {
    let res: ColumnProps = {};
    const width = get(cacheWidthMap, i.name || '');
    const dataWidth = width ? width : initWidth;
    const isLast = index === _list.length - 1;
    switch (i.type) {
      // 文本
      case FieldItemType.Text:
        res = {
          // @ts-expect-error -- linter-disable-autofix
          className:
            isLast && `${styles['last-column-text']} not-resize-handle`,
          title: getTitle(i.name as string, i.must_required || false),
          dataIndex: i.name,
          width: isLast ? undefined : dataWidth,
        };
        break;
      // 整数
      case FieldItemType.Number:
        res = {
          // @ts-expect-error -- linter-disable-autofix
          className:
            isLast && `${styles['last-column-min-width']} not-resize-handle`,
          title: getTitle(i.name as string, i.must_required || false),
          dataIndex: i.name,
          width: isLast ? undefined : dataWidth,
        };
        break;
      // 数字
      case FieldItemType.Float:
        res = {
          // @ts-expect-error -- linter-disable-autofix
          className:
            isLast && `${styles['last-column-min-width']} not-resize-handle`,
          title: getTitle(i.name as string, i.must_required || false),
          dataIndex: i.name,
          width: isLast ? undefined : dataWidth,
        };
        break;
      // 时间
      case FieldItemType.Date:
        res = {
          // @ts-expect-error -- linter-disable-autofix
          className:
            isLast && `${styles['last-column-date']} not-resize-handle`,
          title: getTitle(i.name as string, i.must_required || false),
          dataIndex: i.name,
          width: isLast ? undefined : dataWidth,
        };
        break;
      // 布尔
      case FieldItemType.Boolean:
        res = {
          // @ts-expect-error -- linter-disable-autofix
          className:
            isLast && `${styles['last-column-min-width']} not-resize-handle`,
          title: getTitle(i.name as string, i.must_required || false),
          dataIndex: i.name,
          width: isLast ? undefined : dataWidth,
        };
        break;
      default:
        break;
    }
    return res;
  });

  const defaultWidth = 120;
  return {
    list,
    width: list.reduce(
      (prev: number, cur: ColumnProps) =>
        prev + (Number(cur.width) || defaultWidth),
      0,
    ) as number,
  };
};
