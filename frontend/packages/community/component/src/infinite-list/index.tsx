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
} from 'react';

import cls from 'classnames';
import { ResponsiveList } from '@coze-arch/responsive-kit';
import { List } from '@coze-arch/bot-semi';

import { type InfiniteListProps, type InfiniteListRef } from './type';
import useScroll from './hooks/use-scroll';
import Footer from './components/footer';
import Empty from './components/empty';

import s from './index.module.less';

/* Plugin header */

function Index<T extends object>(props: InfiniteListProps<T>, ref) {
  const {
    isSearching,
    className,
    emptyContent,
    grid,
    renderItem,
    itemClassName,
    renderFooter,
    scrollConf,
    emptyConf,
    onChangeState,
    canShowData = true,
    isNeedBtnLoadMore = false,
    isResponsive,
    retryFunc,
    responsiveConf,
    containerClassName,
  } = props;

  const {
    dataList,
    isLoading,
    loadMore,
    noMore,
    isLoadingError,
    mutate,
    reload,
    insertData,
    removeData,
    getDataList,
  } = useScroll<T>({ ...scrollConf, isNeedBtnLoadMore });

  useImperativeHandle(
    ref,
    () => ({ mutate, reload, insertData, removeData, getDataList }),
    [mutate, reload, insertData, removeData, getDataList],
  );
  useEffect(() => {
    onChangeState?.(isLoading, dataList);
  }, [dataList, isLoading]);

  // Adapt the mobile end of the list according to the whitelist

  return (
    <div className={cls(s['height-whole-100'], containerClassName)}>
      {!dataList?.length || !canShowData ? (
        /** How to display an empty page when the data is empty */
        <Empty
          isError={canShowData ? isLoadingError : false}
          isSearching={isSearching}
          isLoading={canShowData ? isLoading : true}
          loadRetry={retryFunc || loadMore}
          {...emptyConf}
        />
      ) : isResponsive ? (
        <ResponsiveList<T>
          className={className}
          emptyContent={isLoading ? <></> : emptyContent}
          dataSource={dataList}
          renderItem={(item, number) => renderItem?.(item, number)}
          gridCols={responsiveConf?.gridCols}
          gridGapXs={{
            basic: 4,
          }}
          footer={
            <div className="text-sm px-6 py-3">
              <Footer
                isError={isLoadingError}
                noMore={noMore}
                isLoading={isLoading}
                loadRetry={retryFunc || loadMore}
                renderFooter={renderFooter}
                isNeedBtnLoadMore={isNeedBtnLoadMore}
              />
            </div>
          }
        />
      ) : (
        <List
          {...{ className, emptyContent, grid }}
          emptyContent={isLoading ? <></> : emptyContent}
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
  props: InfiniteListProps<T> & { ref?: RefObject<InfiniteListRef> },
) => JSX.Element;
