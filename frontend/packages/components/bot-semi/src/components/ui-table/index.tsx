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

import React, {
  Dispatch,
  SetStateAction,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { ReactElement } from 'react-markdown/lib/react-markdown';
import { Root, createRoot } from 'react-dom/client';
import { assign } from 'lodash-es';
import classNames from 'classnames';
import { useSize } from 'ahooks';
import { i18nContext, type I18nContext } from '@coze-arch/i18n/i18n-provider';
import { TableProps } from '@douyinfe/semi-ui/lib/es/table';
import { Table, Spin } from '@douyinfe/semi-ui';
import { IconSpin } from '@douyinfe/semi-icons';

import styles from './index.module.less';

export interface EmptyPropsType {
  label?: string;
}

export interface UITableProps {
  offsetY?: number;
  scrollX?: number;
  tableProps?: TableProps;
  bySearch?: boolean;
  empty?: ReactElement;
  enableLoad?: boolean;
  total?: number;
  onLoad?: () => void;
  wrapperClassName?: string;
  useHoverStyle?: boolean;
  mergeTableList?: (
    listA: Array<unknown>,
    listB: Array<unknown>,
  ) => Array<unknown>;
}

export interface UITableMethods {
  reset: () => void;
  getTableList: <T>() => Array<T>;
}

export const UITable = forwardRef<UITableMethods, UITableProps>(
  (
    {
      offsetY = 0,
      scrollX = 0,
      tableProps: propsTableProps,
      empty,
      total = 0,
      onLoad,
      enableLoad,
      wrapperClassName,
      useHoverStyle = true,
      mergeTableList = (tableA, tableB) => [...tableA, ...tableB],
    },
    ref,
  ) => {
    const { dataSource, ...tableProps } = propsTableProps ?? {};
    const size = useSize(document.body);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
      if (!tableProps?.loading) {
        setInitialized(true);
      }
    }, [tableProps?.loading]);

    const showTable = initialized && !!dataSource?.length;

    /**
     * TODO: handle bottom loading, a lump of 💩, to be optimized
     */
    const IndicatorRoot = useRef<Root>();

    const tableRef = useRef(null);
    const onLoadRef = useRef(onLoad);

    const delayClear = useRef(false);

    const [innerData, setInnerData] = useState([]);
    const indicatorFlag = useRef(false);
    const needRenderIndicator = total > innerData.length;
    const needLoad = needRenderIndicator && !tableProps.loading;

    const needLoadRef = useRef(needLoad);

    const indicatorRef = useRef<IndicatorMethods>(null);

    indicatorRef.current?.changeState({
      done: total <= innerData.length,
    });

    useEffect(() => {
      onLoadRef.current = onLoad;
      needLoadRef.current = !!enableLoad && needLoad;
    }, [onLoad, needLoad, enableLoad]);

    useEffect(() => {
      if (needLoadRef.current && enableLoad && !delayClear.current) {
        // @ts-expect-error -- linter-disable-autofix
        setInnerData(d => mergeTableList(d, dataSource ?? []));
      } else {
        // @ts-expect-error -- linter-disable-autofix
        setInnerData(dataSource ?? []);
      }
      delayClear.current = false;
    }, [dataSource, enableLoad]);

    useEffect(() => {
      if (tableRef.current && enableLoad && needRenderIndicator) {
        const tableContainer =
          // FIXME: This code has so many layers of refs and needs to be optimized
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (tableRef.current as any).tableRef.current.bodyWrapRef.current;

        if (enableLoad) {
          if (!indicatorFlag.current) {
            const f = document.createElement('div');

            tableContainer.append(f);

            IndicatorRoot.current = createRoot(f);
            IndicatorRoot.current.render(
              <Indicator
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
    }, [showTable, enableLoad, needRenderIndicator]);

    useImperativeHandle(ref, () =>
      assign({}, tableRef.current, {
        reset: () => {
          delayClear.current = true;
        },
        getTableList: () => innerData,
      }),
    );

    return (
      <div className={classNames(styles['table-wrapper'], wrapperClassName)}>
        {!initialized && (
          <div className={styles['spin-container']}>
            <Spin spinning={true} size="large" />
          </div>
        )}
        {showTable ? (
          <Table
            ref={tableRef}
            pagination={false}
            scroll={{ y: (size?.height || 0) - offsetY, x: scrollX }}
            {...tableProps}
            className={classNames(styles['table-list'], tableProps.className, {
              [styles.tableListHoverStyle]: useHoverStyle,
            })}
            loading={enableLoad ? false : tableProps?.loading}
            dataSource={enableLoad ? innerData : dataSource}
          />
        ) : null}

        {/* empty state */}
        {initialized && !tableProps?.loading && !dataSource?.length ? (
          <div className={styles['empty-content']}>{empty}</div>
        ) : null}
      </div>
    );
  },
);

// Indicatore component
interface IndicatorState {
  done: boolean;
}
interface IndicatorProps {
  onIntersecting: (isIntersecting: boolean) => void;
}

interface IndicatorMethods {
  changeState: Dispatch<SetStateAction<IndicatorState>>;
}

const Indicator = forwardRef<IndicatorMethods, IndicatorProps>(
  ({ onIntersecting }, ref) => {
    const { i18n } = useContext<I18nContext>(i18nContext);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<IndicatorState>({
      done: false,
    });

    useEffect(() => {
      const intersectionHandler = (entries: IntersectionObserverEntry[]) => {
        const isIntersecting = entries[0]?.isIntersecting;

        onIntersecting(isIntersecting);
      };
      const observer = new IntersectionObserver(intersectionHandler);
      indicatorRef.current && observer.observe(indicatorRef.current);
      return () => observer.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
      changeState: setState,
    }));

    return !state.done ? (
      <div ref={indicatorRef} className={styles.indicator}>
        {!state.done && <IconSpin className={styles['indicator-loading']} />}
        <span>{state.done ? '' : i18n.t('loading')}</span>
      </div>
    ) : null;
  },
);
