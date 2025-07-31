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
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  useInfiniteScroll,
  useUpdateEffect,
  useMemoizedFn,
  useDebounceFn,
} from 'ahooks';

import { type ScrollProps, type InfiniteListDataProps } from '../type';

/* Rolling Hooks */

function useForwardFunc<T>(
  dataInfo: InfiniteListDataProps<T>,
  mutate: Dispatch<SetStateAction<InfiniteListDataProps<T>>>,
) {
  // Insert data manually, without going through the interface
  const insertData = (item, index) => {
    dataInfo.list.splice(index, 0, item);
    mutate({
      ...dataInfo,
      list: [...(dataInfo?.list || [])],
    });
  };

  // Delete data manually, without going through the interface
  const removeData = index => {
    dataInfo.list.splice(index, 1);
    mutate({
      ...dataInfo,
      list: [...(dataInfo?.list || [])],
    });
  };

  const getDataList = () => dataInfo?.list;

  return { insertData, removeData, getDataList };
}

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function -- the number of lines of code is not very good optimization
function useScroll<T>(props: ScrollProps<T>) {
  const {
    targetRef,
    loadData,
    threshold,
    reloadDeps,
    isNeedBtnLoadMore,
    resetDataIfReload = true,
  } = props;
  const [isLoadingError, setIsLoadingError] = useState<boolean>(false);
  const refFetchNo = useRef<number>(0);
  const refResolve = useRef<(value) => void>();
  const {
    loading,
    data: dataInfo,
    loadingMore,
    loadMore,
    noMore,
    cancel,
    mutate,
    reload,
  } = useInfiniteScroll<InfiniteListDataProps<T>>(
    async current => {
      // The logic here is so complex that it solves the bug in Scroll.
      // The cancel in useInfiniteScroll simply cancels a request, but the data is reset based on the current.
      const fetchNo = refFetchNo.current;
      if (refResolve.current) {
        // Guaranteed sequential execution, if there is a current method, cancel the last request to prevent data overwriting problems due to network reasons
        // At the same time, A1, A2, and three requests were issued, but A1 arrived first, and then B1 was requested, but A1 was too slow, causing A1 to overwrite B1's request.
        refResolve.current({
          ...(current || {}),
          list: [],
        });
      }

      const result = await new Promise((resolve, reject) => {
        refResolve.current = resolve;
        loadData(current)
          .then(value => resolve(value))
          .catch(err => reject(err));
      });

      // @ts-expect-error -- linter-disable-autofix
      refResolve.current = null;

      // When switching tabs, if you are requesting at this time, prevent the residual interface display of the data
      if (refFetchNo.current !== fetchNo) {
        if (current) {
          current.list = [];
        }
        return {
          list: [],
          nextPage: 1,
        };
      }
      return result as InfiniteListDataProps<T>;
    },
    {
      target: isLoadingError || isNeedBtnLoadMore ? null : targetRef, //When it fails, scrolling loading is prohibited by removing the event binding of the target.
      threshold,
      onBefore: () => {
        //setIsLoadingError(false);
      },
      isNoMore: data => data?.hasMore !== undefined && !data?.hasMore,
      onSuccess: () => {
        if (isLoadingError) {
          setIsLoadingError(false);
        }
      },
      onError: e => {
        // If an error occurs when requesting the first page of data and the current list is not empty, reset the data
        // This case only occurs when resetDataIfReload is set to false
        // @ts-expect-error -- linter-disable-autofix
        if (dataInfo.nextPage === 1 && (dataInfo?.list?.length ?? 0) > 0) {
          // @ts-expect-error -- linter-disable-autofix
          mutate({
            ...dataInfo,
            list: [],
          });
        }
        setIsLoadingError(true);
      },
    },
  );

  const { insertData, removeData, getDataList } = useForwardFunc(
    // @ts-expect-error -- linter-disable-autofix
    dataInfo,
    mutate,
  );

  useEffect(() => {
    if (isNeedBtnLoadMore && !(loading || loadingMore)) {
      reload();
    }
  }, []);

  const reloadData = useMemoizedFn(() => {
    mutate({
      list: resetDataIfReload ? [] : dataInfo?.list ?? [],
      hasMore: undefined,
      nextPage: 1,
    });
    cancel();
    setIsLoadingError(false);
    reload();
  });

  useUpdateEffect(() => {
    refFetchNo.current++;
    reloadData();
  }, [...(reloadDeps || [])]);
  const isLoading = loading || loadingMore || props.isLoading;
  const { run: loadMoreDebounce } = useDebounceFn(
    () => {
      if (isLoading) {
        return;
      }
      if (!isNeedBtnLoadMore) {
        loadMore();
      }
    },
    { wait: 500 },
  );
  useEffect(() => {
    const resize = () => {
      loadMoreDebounce();
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);
  const { list } = dataInfo || {};
  return {
    dataList: list,
    isLoading,
    loadMore: () => {
      if (!isLoading) {
        //If there is already data loading, you need to prohibit repeated loading.
        loadMore();
      }
    },
    reload: reloadData,
    noMore,
    cancel,
    isLoadingError,
    mutate,
    insertData,
    removeData,
    getDataList,
  };
}

export default useScroll;
