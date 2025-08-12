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
  // Uniquely identifies the table and is used as the key value in the column width cache map
  tableKey?: string;
  // Class name for style overrides
  className?: string;
  // Edit Configuration
  editProps?: {
    // Callback for data deletion, batch support
    onDelete?: (indexs: (string | number)[]) => void;
    // Line operations edit line callbacks
    onEdit?: (record: TableViewRecord, index: string | number) => void;
  };
  // Scroll to the bottom of the callback
  scrollToBottom?: () => void | Promise<void>;
  // Drag hook
  onResize?: (col: TableViewColumns) => void;
  // Whether to enable virtual scrolling, the default is false
  isVirtualized?: boolean;
  // Whether to enable scaled columns, the default is false
  resizable?: boolean;
  // Whether to enable line selection, the default is false
  rowSelect?: boolean;
  // Whether line operations are supported, the default is false
  rowOperation?: boolean;
  // data
  dataSource: TableViewRecord[];
  // header item
  columns: TableViewColumns[];
  // The data is empty.
  empty?: ReactNode;
  // loading
  loading?: boolean;
  // No consumption, only used to trigger the rendered state, which needs to be optimized
  resizeTriState?: number;
  // Additional tableProps
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
                // If the right-click position is not selected, uncheck it
                if (
                  rowIndex &&
                  selected?.length &&
                  !selected.includes(String(rowIndex))
                ) {
                  setSelected([]);
                }
                // right-click to display the menu
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
         * This line has no margin at all, and there may be bad cases in different browsers that cannot meet the conditions.
         * If you encounter similar feedback, you can give priority to checking here.
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
                            // Cache column width after resizing
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
