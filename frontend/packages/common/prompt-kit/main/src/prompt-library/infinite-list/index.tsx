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

import {
  forwardRef,
  useImperativeHandle,
  type RefObject,
  useEffect,
  type ForwardedRef,
} from 'react';

import cls from 'classnames';
import { List } from '@coze-arch/coze-design';

import useScroll from './use-scroll';
import { type InfiniteListProps, type InfiniteListRef } from './type';
import Footer from './footer';
import Empty from './empty';

import s from './index.module.less';
export type { InfiniteListRef };

// modify from packages/community/components/src/infinite-list/index.tsx
function Index<T extends object>(
  props: InfiniteListProps<T>,
  ref: ForwardedRef<InfiniteListRef<T>>,
) {
  const {
    className,
    grid,
    renderItem,
    itemClassName,
    renderFooter,
    scrollConf,
    onChangeState,
    isNeedBtnLoadMore = false,
    retryFunc,
    containerClassName,
    emptyConf,
  } = props;

  const {
    dataList,
    isLoading,
    loadMore,
    noMore,
    isLoadingError,
    reload,
    getDataList,
  } = useScroll<T>({ ...scrollConf, isNeedBtnLoadMore });

  useImperativeHandle(
    ref,
    () => ({
      reload,
      getDataList,
    }),
    [reload, getDataList],
  );
  useEffect(() => {
    onChangeState?.(!!isLoading, dataList ?? []);
  }, [dataList, isLoading]);

  return (
    <div className={cls(s['height-whole-100'], containerClassName)}>
      {!dataList?.length ? (
        /** How to display an empty page when the data is empty */
        <Empty
          isError={isLoadingError}
          isLoading={isLoading}
          loadRetry={retryFunc || loadMore}
          {...emptyConf}
        />
      ) : (
        <List
          {...{ className, grid }}
          emptyContent={<></>}
          dataSource={dataList}
          split={false}
          renderItem={(item, number) => (
            <List.Item
              className={
                typeof itemClassName === 'string'
                  ? itemClassName
                  : itemClassName?.(item) // Support dynamic row className
              }
            >
              {renderItem?.(item, number)}
            </List.Item>
          )}
          footer={
            <Footer
              isError={isLoadingError}
              noMore={noMore}
              isLoading={isLoading}
              loadRetry={retryFunc || loadMore}
              renderFooter={renderFooter}
              isNeedBtnLoadMore={isNeedBtnLoadMore}
              dataNum={dataList?.length}
            />
          }
        />
      )}
    </div>
  );
}

export const InfiniteList = forwardRef(Index) as <T>(
  props: InfiniteListProps<T> & { ref?: RefObject<InfiniteListRef<T>> },
) => JSX.Element;
