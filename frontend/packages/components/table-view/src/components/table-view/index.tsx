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
 
/* eslint-disable @coze-arch/max-line-per-function */
import React, {
  useState,
  useMemo,
  type ReactNode,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';

import classNames from 'classnames';
import { useDebounceFn } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { useTheme } from '@coze-arch/coze-design';
import {
  type RowSelectionProps,
  type TableProps,
  type OnCellReturnObject,
  type VirtualizedOnScrollArgs,
} from '@coze-arch/bot-semi/Table';
import { UIEmpty, UITable } from '@coze-arch/bot-semi';
import { AutoSizer } from '@coze-common/virtual-list';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';

import {
  type TableViewRecord,
  EditMenuItem,
  type TableViewColumns,
  type TableViewValue,
} from '../types';
import { TextRender } from '../renders';
import { resizeFn, getRowKey } from './utils';
import { colWidthCacheService } from './service';
import { EditMenu, EditToolBar } from './edit-menu';

import styles from './index.module.less';

export interface TableViewProps {
  // 唯一标识表,且会作为列宽缓存map中的key值
  tableKey?: string;
  // 类名，用于样式覆盖
  className?: string;
  // 编辑配置
  editProps?: {
    // 数据删除的回调，支持批量
    onDelete?: (indexs: (string | number)[]) => void;
    // 行操作编辑行的回调
    onEdit?: (record: TableViewRecord, index: string | number) => void;
  };
  // 滚动到底部的回调
  scrollToBottom?: () => void | Promise<void>;
  // 拖拽钩子
  onResize?: (col: TableViewColumns) => void;
  // 是否开启虚拟滚动，默认为false
  isVirtualized?: boolean;
  // 是否开启伸缩列，默认为false
  resizable?: boolean;
  // 是否开启行选择，默认为false
  rowSelect?: boolean;
  // 是否支持行操作，默认为false
  rowOperation?: boolean;
  // 数据
  dataSource: TableViewRecord[];
  // 表头项
  columns: TableViewColumns[];
  // 数据为空的兜底展示
  empty?: ReactNode;
  // loading
  loading?: boolean;
  // 不消费，仅用于触发渲染的state，需优化
  resizeTriState?: number;
  // 额外 tableProps
  tableProps?: TableProps;
}
export interface TableViewMethods {
  resetSelected: () => void;
  getTableHeight: () => number;
}
export interface TableWrapperProps {
  isVirtualized: boolean;
  children: (props?: TableProps) => ReactNode;
  onScroll: (args: VirtualizedOnScrollArgs & { height: number }) => void;
}

const ITEM_SIZE = 56;
const HEADER_SIZE = 41;
const MOUSE_LEFT_BTN = 1;
const MOUSE_RIGHT_BTN = 2;
const SAFEY = 36;
const SAFEX = 176;

const TableWrapper = ({
  isVirtualized,
  onScroll,
  children,
}: TableWrapperProps) => {
  if (isVirtualized) {
    return (
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) =>
          children({
            scroll: { y: height - HEADER_SIZE, x: width },
            style: {
              width,
            },
            virtualized: {
              itemSize: ITEM_SIZE,
              onScroll: scrollProps => onScroll({ ...scrollProps, height }),
              overScanCount: 30,
            },
          })
        }
      </AutoSizer>
    );
  }
  return <React.Fragment>{children()}</React.Fragment>;
};

const EmptyStatus = () => (
  <UIEmpty
    empty={{
      icon: <IllustrationNoResult />,
      description: I18n.t('dataset_segment_empty_desc'),
    }}
  ></UIEmpty>
);

export const TableView = forwardRef<TableViewMethods, TableViewProps>(
  (
    {
      tableKey,
      editProps = {},
      isVirtualized = false,
      rowSelect = false,
      rowOperation = false,
      resizable = false,
      dataSource,
      columns,
      loading = false,
      className,
      scrollToBottom,
      empty,
      onResize,
      tableProps: extraTableProps = {},
    },
    ref,
  ) => {
    const { onEdit, onDelete } = editProps;
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const [selected, setSelected] = useState<(string | number)[]>([]);
    const [focusRow, setFocusRow] = useState<number>();
    const { theme } = useTheme();
    const currentThemeClassName = useMemo(
      () => (theme === 'dark' ? styles.dark : styles.light),
      [theme],
    );
    const toolBarVisible = useMemo(() => !!selected?.length, [selected]);
    const tableData = useMemo(
      () =>
        dataSource.map((data, index) => ({
          ...data,
          tableViewKey: String(index),
        })),
      [dataSource],
    );
    const menuConfigs = useMemo(() => {
      if (selected?.length && selected?.length > 1) {
        return [EditMenuItem.DELETEALL];
      }
      return [EditMenuItem.EDIT, EditMenuItem.DELETE];
    }, [selected]);
    const columnsHandler = (cols: TableViewColumns) =>
      cols.map(
        (col: TableViewColumns): TableViewColumns => ({
          ...col,
          onCell: (
            _record?: TableViewRecord,
            rowIndex?: number,
          ): OnCellReturnObject => ({
            onContextMenu: (e: { preventDefault: () => void }) => {
              e.preventDefault();
            },
            onMouseDown: (e: React.MouseEvent) => {
              if (e.button === MOUSE_LEFT_BTN) {
                setMenuVisible(false);
              }
              if (e.button === MOUSE_RIGHT_BTN && rowOperation) {
                e.preventDefault();
                const { offsetWidth, offsetHeight } = document.body;
                // 如果右键位置非选中项,取消选中
                if (
                  rowIndex &&
                  selected?.length &&
                  !selected.includes(String(rowIndex))
                ) {
                  setSelected([]);
                }
                // 右键展示菜单
                setFocusRow(rowIndex);
                setMenuVisible(true);
                setMenuStyle({
                  position: 'fixed',
                  top:
                    e.pageY + SAFEY * menuConfigs.length > offsetHeight
                      ? e.pageY - SAFEY * menuConfigs.length
                      : e.pageY,
                  left:
                    e.pageX + SAFEX > offsetWidth ? e.pageX - SAFEX : e.pageX,
                  zIndex: 100,
                });
              }
            },
          }),
          render: col.render
            ? col.render
            : (
                text: TableViewValue,
                record: TableViewRecord,
                index: number,
              ) => <TextRender value={text} record={record} index={index} />,
        }),
      );
    const [newColumns, setNewColumns] = useState<TableViewColumns[]>(
      columnsHandler(columns),
    );
    const rowSelection = useMemo(
      (): RowSelectionProps<TableViewRecord> => ({
        width: 38,
        fixed: true,
        selectedRowKeys: selected,
        onChange: selectedRowKeys => {
          setMenuVisible(false);
          setSelected(selectedRowKeys ?? []);
        },
      }),
      [selected, setSelected],
    );

    const publicEditProps = {
      selected: {
        record: focusRow ? tableData[focusRow] : {},
        indexs: selected?.length ? selected : [Number(focusRow)],
      },
      style: menuStyle,
      configs: menuConfigs,
      onDelete,
      onEdit,
    };

    const debounceScrollToBottom = useDebounceFn(
      () => {
        scrollToBottom?.();
      },
      {
        wait: 100,
      },
    );
    const onScroll = ({
      scrollDirection,
      scrollOffset,
      scrollUpdateWasRequested,
      height,
    }: VirtualizedOnScrollArgs & { height: number }) => {
      setMenuVisible(false);
      if (
        scrollDirection === 'forward' &&
        scrollOffset &&
        /**
         * 这一行一点余量都没留 可能在不同浏览器渲染下会有 bad case 导致无法满足条件
         * 如果有遇到类似反馈可以优先排查这里
         */
        scrollOffset + height - HEADER_SIZE >= tableData.length * ITEM_SIZE &&
        !scrollUpdateWasRequested &&
        debounceScrollToBottom
      ) {
        debounceScrollToBottom.run();
      }
    };
    const getTableHeight = () => {
      const bodyH = ITEM_SIZE * (tableData?.length || 0);
      return bodyH + HEADER_SIZE;
    };
    useImperativeHandle(ref, () => ({
      resetSelected: () => setSelected([]),
      getTableHeight,
    }));

    useEffect(() => {
      colWidthCacheService.initWidthMap();
    }, []);
    useEffect(() => {
      setNewColumns(columnsHandler(columns));
    }, [columns]);
    useEffect(() => {
      setNewColumns(columnsHandler(newColumns));
    }, [menuConfigs.length]);

    return (
      <div className={classNames([styles['data-table-view']], className)}>
        {tableData.length || loading ? (
          <>
            <TableWrapper isVirtualized={isVirtualized} onScroll={onScroll}>
              {(tableProps?: TableProps) => (
                <UITable
                  key={tableKey}
                  wrapperClassName={`${styles['table-wrapper']} ${currentThemeClassName} table-wrapper`}
                  tableProps={{
                    ...(tableProps || {}),
                    ...extraTableProps,
                    rowKey: getRowKey,
                    resizable: resizable
                      ? {
                          onResize: col =>
                            onResize ? onResize(col) : resizeFn(col),
                          onResizeStop: col => {
                            // resize完后缓存列宽
                            const resizedCols = newColumns.map(oCol => {
                              if (oCol.dataIndex === col.dataIndex) {
                                return col;
                              }
                              return oCol;
                            });
                            setNewColumns(resizedCols);
                            const widthMap: Record<string, number> = {};
                            resizedCols.forEach(resizedCol => {
                              if (resizedCol.dataIndex) {
                                widthMap[resizedCol.dataIndex] =
                                  resizedCol.width;
                              }
                            });
                            colWidthCacheService.setWidthMap(
                              widthMap,
                              tableKey,
                            );
                          },
                        }
                      : false,
                    loading,
                    rowSelection: rowSelect ? rowSelection : false,
                    pagination: false,
                    dataSource: tableData,
                    columns: newColumns,
                  }}
                />
              )}
            </TableWrapper>

            <EditMenu
              {...publicEditProps}
              visible={menuVisible}
              onExit={() => setMenuVisible(false)}
            />
            <EditToolBar
              {...publicEditProps}
              visible={toolBarVisible}
              onExit={() => setSelected([])}
            />
          </>
        ) : null}
        {!dataSource.length && !loading ? (
          empty ? (
            empty
          ) : (
            <EmptyStatus />
          )
        ) : null}
      </div>
    );
  },
);
