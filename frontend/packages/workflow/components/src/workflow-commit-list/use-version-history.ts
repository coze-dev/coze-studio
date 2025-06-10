import { useCallback, useMemo, useState } from 'react';

import {
  type UseInfiniteQueryResult,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  type VersionMetaInfo,
  type VersionHistoryListRequest,
  type OperateType,
  workflowApi,
} from '@coze-workflow/base/api';

type VersionHistoryQueryParams = Omit<
  VersionHistoryListRequest,
  'limit' | 'cursor'
>;

interface VersionHistoryParams {
  spaceId: string;
  workflowId: string;
  type: OperateType;
  /** 每页请求数量, 默认 10 */
  pageSize?: number;
  /** 是否启动请求, 默认 false */
  enabled?: boolean;
}

interface VersionHistoryReturn {
  queryParams: VersionHistoryQueryParams;
  updatePageParam: (newParam: Partial<VersionHistoryListRequest>) => void;
  list: VersionMetaInfo[];
  queryError: UseInfiniteQueryResult['error'];
  loadingStatus: UseInfiniteQueryResult['status'];
  refetch: UseInfiniteQueryResult['refetch'];
  fetchNextPage: UseInfiniteQueryResult['fetchNextPage'];
  isFetching: UseInfiniteQueryResult['isFetching'];
  isFetchingNextPage: UseInfiniteQueryResult['isFetchingNextPage'];
  hasNextPage: UseInfiniteQueryResult['hasNextPage'];
}

export function useVersionHistory({
  spaceId,
  workflowId,
  type,
  pageSize = 10,
  enabled = false,
}: VersionHistoryParams): Readonly<VersionHistoryReturn> {
  const [queryParams, setQueryParams] = useState<VersionHistoryQueryParams>({
    space_id: spaceId,
    workflow_id: workflowId,
    type,
  });
  const initialPageParam = useMemo<VersionHistoryListRequest>(
    () => ({
      ...queryParams,
      limit: pageSize,
      last_commit_id: '',
    }),
    [queryParams, pageSize],
  );

  const updatePageParam = useCallback(
    (newParam: Partial<VersionHistoryQueryParams>) => {
      setQueryParams(prevParams => ({
        ...prevParams,
        ...newParam,
      }));
    },
    [],
  );

  const queryKey = useMemo(
    () => ['workflowApi_OperateList', JSON.stringify(initialPageParam)],
    [initialPageParam],
  );

  const fetchList = async (params: VersionHistoryListRequest) => {
    const resp = await workflowApi.VersionHistoryList(params);

    return resp.data;
  };

  const {
    data: pageData,
    error: queryError,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status: loadingStatus,
    refetch,
  } = useInfiniteQuery({
    enabled: Boolean(spaceId && workflowId && enabled),
    queryKey,
    queryFn: ({ pageParam }) => fetchList(pageParam),
    initialPageParam,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (!lastPage?.has_more) {
        return null;
      }
      return {
        ...lastPageParam,
        cursor: lastPage.cursor || '',
      };
    },
  });

  const targetList = useMemo(() => {
    const result: VersionMetaInfo[] = [];
    const idMap: Record<string, boolean> = {};

    pageData?.pages.forEach(page => {
      page?.version_list?.forEach(item => {
        const key = item.commit_id || '';
        if (!idMap[key]) {
          result.push(item);
        }
        idMap[key] = true;
      });
    });

    return result;
  }, [pageData]);

  return {
    queryParams,
    updatePageParam,

    list: targetList,
    queryError,
    loadingStatus,
    refetch,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
  } as const;
}
