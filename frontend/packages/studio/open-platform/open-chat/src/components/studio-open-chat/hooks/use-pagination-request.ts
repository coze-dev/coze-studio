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

import { useState, useCallback, useEffect } from 'react';

import { useRequest } from 'ahooks';

interface PaginationParams {
  page_num?: number;
  page_size?: number;
  [key: string]: unknown;
}

interface PaginationResponse<T> {
  data: T[];
  has_more?: boolean;
  total?: number;
  [key: string]: unknown;
}

interface UsePaginationRequestParams<T, P extends PaginationParams> {
  requestFn: (params: P) => Promise<PaginationResponse<T>>;
  requestParams: Omit<P, 'page_num' | 'page_size'>;
  pageSize?: number;
  initialPageNum?: number;
  autoLoad?: boolean;
  dataKey?: string;
  hasMoreKey?: string;
}

interface UsePaginationRequestReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | undefined;
  hasMore: boolean;
  currentPage: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPageNum: (pageNum: number) => void;
  reset: () => Promise<void>;
}

export const usePaginationRequest = <T, P extends PaginationParams>({
  requestFn,
  requestParams,
  pageSize = 20,
  initialPageNum = 1,
  autoLoad = true,
}: UsePaginationRequestParams<T, P>): UsePaginationRequestReturn<T> => {
  const [currentPage, setCurrentPage] = useState(initialPageNum);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { loading, error, run } = useRequest(
    async (pageNum?: number) => {
      const targetPage = pageNum ?? currentPage;
      const params = {
        ...requestParams,
        page_size: pageSize,
        page_num: targetPage,
      };

      const res = await requestFn(params as P);
      return res;
    },
    {
      manual: true,
      onSuccess: (res, [pageNum]) => {
        const targetPage = pageNum ?? currentPage;
        const responseData = res.data;
        const responseHasMore = !!res.has_more;

        if (targetPage === 1) {
          // 如果是第一页，直接替换数据
          setAllData(responseData);
        } else {
          // 如果是加载更多，追加数据
          setAllData(prev => [...prev, ...responseData]);
        }

        setHasMore(responseHasMore);
        setCurrentPage(targetPage);
      },
      onError: err => {
        console.error('分页请求失败:', err);
      },
    },
  );

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await run(currentPage + 1);
    }
  }, [loading, hasMore, currentPage, run]);

  const refresh = useCallback(async () => {
    setAllData([]);
    setCurrentPage(1);
    await run(1);
  }, [run]);

  const setPageNum = useCallback(
    async (pageNum: number) => {
      if (pageNum >= 1) {
        await run(pageNum);
      }
    },
    [run],
  );

  const reset = useCallback(async () => {
    setAllData([]);
    setCurrentPage(initialPageNum);
    await setHasMore(false);
  }, [initialPageNum]);

  // 组件挂载时自动加载第一页
  useEffect(() => {
    if (autoLoad) {
      run(initialPageNum);
    }
  }, [autoLoad, initialPageNum, run]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    currentPage,
    loadMore,
    refresh,
    setPageNum,
    reset,
  };
};
