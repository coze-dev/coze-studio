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

import { type ScrollProps, type InfiniteListDataProps } from './type';

/* 滚动Hooks */

function useForwardFunc<T>(
  dataInfo: InfiniteListDataProps<T>,
  mutate: Dispatch<SetStateAction<InfiniteListDataProps<T>>>,
) {
  // 手动插入数据，不通过接口
  const insertData = (item: T, index: number) => {
    dataInfo.list.splice(index, 0, item);
    mutate({
      ...dataInfo,
      list: [...dataInfo.list],
    });
  };

  // 手动删除数据，不通过接口
  const removeData = (index: number) => {
    dataInfo.list.splice(index, 1);
    mutate({
      ...dataInfo,
      list: [...dataInfo.list],
    });
  };

  const getDataList = () => dataInfo?.list;

  return { insertData, removeData, getDataList };
}

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function  -- 看了下代码行数不太好优化
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
  const refResolve = useRef<(value: InfiniteListDataProps<T>) => void>();
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
      // 此处逻辑如此复杂，是解决Scroll中的bug。
      // useInfiniteScroll中的cancel只是取消了一次请求，但是数据会根据current重新设置一遍。
      const defaultData = {
        cursor: '0',
        list: [],
      };
      const fetchNo = refFetchNo.current;
      if (refResolve.current) {
        // 保证顺序执行，如果有当前方法，就取消上一次的请求，防止出现由于网络原因导致数据覆盖问题
        // 同时发出A1,A2,三次请求，但是A1先到达，然后请求了B1, 但是A1过慢，导致了A1覆盖了B1的请求。
        refResolve.current({
          ...defaultData,
          ...(current || {}),
        });
      }

      const result = await new Promise((resolve, reject) => {
        refResolve.current = resolve;
        loadData(current || defaultData)
          .then(value => resolve(value))
          .catch(err => reject(err));
      });

      // @ts-expect-error -- linter-disable-autofix
      refResolve.current = null;

      // 切换Tab的时候，如果此时正在请求，防止数据的残留界面显示
      if (refFetchNo.current !== fetchNo) {
        if (current) {
          current.list = [];
        }
        return {
          list: [],
          cursor: '0',
        };
      }
      return result as InfiniteListDataProps<T>;
    },
    {
      target: isLoadingError || isNeedBtnLoadMore ? null : targetRef, //失败的时候，通过去掉target的事件绑定，禁止滚动加载。
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
        // 如果在请求第一页数据时发生错误，并且当前列表不为空，则reset数据
        // 这个case只有当resetDataIfReload设置为false时才会发生
        // @ts-expect-error -- linter-disable-autofix
        if (dataInfo.cursor === '0' && (dataInfo?.list?.length ?? 0) > 0) {
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
      // @ts-expect-error -- linter-disable-autofix
      list: resetDataIfReload ? [] : dataInfo.list,
      hasMore: undefined,
      cursor: '0',
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
        //如果已经有数据加载中了，需要禁止重复加载。
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
