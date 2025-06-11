/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function -- ignore */
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { type Root, createRoot } from 'react-dom/client';
import { assign, omit } from 'lodash-es';
import clsx from 'clsx';
import { useSize } from 'ahooks';
import { type RowSelectionRenderCell } from '@douyinfe/semi-ui/lib/es/table';

import { cn } from '@/utils';
import { useCDLocale } from '@/locales';
import { Checkbox } from '@/index';
import { Table as SemiTable, Spin as SemiSpin } from '@/components/semi';

import {
  type TableMethods,
  type TableProps,
  type IndicatorMethods,
} from './table-types';
import { TableMeta } from './table-meta';
import { Indicator } from './table-indicator';
import { TableAction } from './table-action';

import './index.css';
export const TableComponent = forwardRef<TableMethods, TableProps>(
  (
    {
      offsetY = 0,
      scrollX = 0,
      tableProps: propsTableProps,
      empty,
      total = 0,
      hasMore = false,
      onLoad,
      enableLoad,
      loadMode = 'page',
      wrapperClassName,
      useHoverStyle = true,
      strictDataSourceProp,
      indexRowSelection,
      showTableWhenEmpty,
      ...rest
    },
    ref,
  ) => {
    const { dataSource, ...tableProps } = propsTableProps ?? {};

    const size = useSize(document.body);
    const [initialized, setInitialized] = useState(false);
    const { i18n } = useCDLocale();

    useEffect(() => {
      if (!tableProps?.loading) {
        setInitialized(true);
      }
    }, [tableProps?.loading]);

    const showTable =
      initialized && (!!dataSource?.length || showTableWhenEmpty);
    const isEmpty = initialized && !tableProps?.loading && !dataSource?.length;

    /**
     * TODO：处理触底加载，一坨💩，待优化
     */
    const IndicatorRoot = useRef<Root>();

    const tableRef = useRef(null);
    const onLoadRef = useRef(onLoad);

    const delayClear = useRef(false);

    const [innerData, setInnerData] = useState([]);
    const indicatorFlag = useRef(false);
    const needRenderIndicator =
      loadMode === 'cursor' ? hasMore : total > innerData.length;
    const needLoad = needRenderIndicator && !tableProps.loading;

    const needLoadRef = useRef(needLoad);

    const indicatorRef = useRef<IndicatorMethods>(null);

    indicatorRef.current?.changeState({
      done: loadMode === 'cursor' ? !hasMore : total <= innerData.length,
    });

    useEffect(() => {
      onLoadRef.current = onLoad;
      needLoadRef.current = !!enableLoad && needLoad;
    }, [onLoad, needLoad, enableLoad]);

    useEffect(() => {
      if (
        (needLoadRef.current || loadMode === 'cursor') &&
        enableLoad &&
        !delayClear.current &&
        !strictDataSourceProp
      ) {
        // @ts-expect-error -- linter-disable-autofix
        setInnerData(d => [...d, ...(dataSource ?? [])]);
      } else {
        // @ts-expect-error -- linter-disable-autofix
        setInnerData(dataSource ?? []);
      }
      delayClear.current = false;
    }, [dataSource, enableLoad]);

    useEffect(() => {
      if (tableRef.current && enableLoad && needRenderIndicator) {
        const tableContainer =
          // FIXME: 这段代码这么多层 ref，需要优化
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (tableRef.current as any).tableRef.current.bodyWrapRef.current;

        if (enableLoad) {
          if (!indicatorFlag.current) {
            const f = document.createElement('div');

            tableContainer.append(f);

            IndicatorRoot.current = createRoot(f);
            IndicatorRoot.current.render(
              <Indicator
                loadedText={i18n.t('loaded')}
                loadingText={i18n.t('loading')}
                ref={indicatorRef}
                onIntersecting={intersecting => {
                  if (intersecting && needLoadRef.current) {
                    onLoadRef.current?.();
                  }
                }}
              />,
            );
            indicatorFlag.current = true;
          }
        }
      } else {
        return () => {
          IndicatorRoot.current?.unmount();
          needLoadRef.current = true;
          indicatorFlag.current = false;
        };
      }
    }, [showTable, enableLoad, needRenderIndicator, delayClear.current]);

    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () =>
      assign({}, tableRef.current, {
        reset: () => {
          const tableScrollContainer =
            containerRef.current?.getElementsByClassName('semi-table-body')[0];
          if (tableScrollContainer) {
            tableScrollContainer.scrollTop = 0;
          }
          delayClear.current = true;
          IndicatorRoot.current?.unmount();
          indicatorFlag.current = false;
        },
        getTableList: () => innerData,
      }),
    );

    const renderRowSelectionCell: RowSelectionRenderCell<unknown> = ({
      selected,
      originNode,
      inHeader,
      index,
      selectRow,
      selectAll,
      ...args
    }) => {
      const cls = clsx(
        'flex items-center justify-center coz-table-checkbox-cell',
        {
          'coz-table-checkbox-cell-selected': selected,
        },
      );

      const checkboxProps = omit(originNode.props, 'prefixCls');

      return (
        <div className={cls}>
          {inHeader ? (
            <Checkbox
              key={originNode.key}
              {...checkboxProps}
              checked={selected}
              onChange={e => {
                selectAll?.(Boolean(e.target.checked), e as unknown as Event);
              }}
            />
          ) : (
            <>
              <span className="coz-table-checkbox-cell-index coz-fg-secondary text-sm font-normal">
                {Number(index) + 1}
              </span>
              <span className="coz-table-checkbox-cell-checkbox">
                <Checkbox
                  key={originNode.key}
                  {...checkboxProps}
                  checked={selected}
                  onChange={e => {
                    selectRow?.(
                      Boolean(e.target.checked),
                      e as unknown as Event,
                    );
                  }}
                />
              </span>
            </>
          )}
        </div>
      );
    };

    return (
      <div
        className={cn('coz-table-wrapper', wrapperClassName)}
        {...rest}
        ref={containerRef}
      >
        {!initialized && (
          <div className="coz-table-spin">
            <SemiSpin spinning={true} size="large" />
          </div>
        )}
        {showTable ? (
          <>
            <SemiTable
              ref={tableRef}
              pagination={false}
              scroll={{ y: (size?.height || 0) - offsetY, x: scrollX }}
              {...tableProps}
              className={cn('coz-table-list', tableProps.className, {
                'coz-table-list-hover': useHoverStyle,
                'coz-table-list-index-row-selection': indexRowSelection,
                'coz-table-only-header': isEmpty && showTableWhenEmpty,
              })}
              loading={enableLoad ? false : tableProps?.loading}
              dataSource={enableLoad ? innerData : dataSource}
              rowSelection={
                indexRowSelection
                  ? {
                      renderCell: renderRowSelectionCell,
                      ...(typeof tableProps?.rowSelection === 'object'
                        ? tableProps?.rowSelection
                        : {}),
                    }
                  : tableProps?.rowSelection
              }
            />
          </>
        ) : null}

        {/* 空状态 */}
        {isEmpty ? <div className="coz-empty-content">{empty}</div> : null}
      </div>
    );
  },
);

TableComponent.displayName = 'Table';

export const Table = Object.assign(TableComponent, {
  Indicator,
  TableMeta,
  TableAction,
});
