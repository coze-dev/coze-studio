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

import { useMemo, useState } from 'react';

import {
  useInfiniteQuery,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { CustomError } from '@coze-arch/bot-error';
import {
  ProductEntityType,
  type ProductInfo,
  type public_api,
  SortType,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

export type GetProductListRequest = public_api.GetProductListRequest;

interface WorkflowProductListReturn {
  updatePageParam: (newParam: Partial<GetProductListRequest>) => void;

  workflowProductList: ProductInfo[];
  queryError: UseInfiniteQueryResult['error'];
  loadingStatus: UseInfiniteQueryResult['status'];
  refetch: UseInfiniteQueryResult['refetch'];
  fetchNextPage: UseInfiniteQueryResult['fetchNextPage'];
  isFetching: UseInfiniteQueryResult['isFetching'];
  isFetchingNextPage: UseInfiniteQueryResult['isFetchingNextPage'];
  hasNextPage: UseInfiniteQueryResult['hasNextPage'];

  copyProduct: (
    item: ProductInfo,
    targetSpaceId: string,
  ) => Promise<{
    workflowId: string;
    pluginId: string;
  }>;
}

// eslint-disable-next-line max-lines-per-function,@coze-arch/max-line-per-function
export function useWorkflowProductList({
  pageSize = 12,
  enabled = false,
}: {
  pageSize?: number;
  enabled?: boolean;
} = {}): Readonly<WorkflowProductListReturn> {
  const [keyword, setKeyword] = useState<string>();
  const [sortType, setSortType] = useState<SortType>(SortType.Heat);
  const [categoryId, setCategoryId] = useState<string>();
  const [source, setSource] = useState<GetProductListRequest['source']>();

  const initialPageParam = useMemo<GetProductListRequest>(
    () => ({
      entity_types: [
        ProductEntityType.WorkflowTemplateV2,
        ProductEntityType.ImageflowTemplateV2,
      ],
      page_num: 1,
      page_size: pageSize,
      category_id: categoryId,
      sort_type: sortType,
      source,
      keyword,
    }),
    [keyword, sortType, categoryId, source],
  );

  const updatePageParam = (newParam: Partial<GetProductListRequest>) => {
    if ('category_id' in newParam) {
      setCategoryId(newParam.category_id);
    }
    if ('sort_type' in newParam) {
      setSortType(newParam.sort_type ?? SortType.Newest);
    }
    if ('keyword' in newParam) {
      setKeyword(newParam.keyword);
    }
    if ('source' in newParam) {
      setSource(newParam.source);
    }
  };

  const queryKey = useMemo(
    () => ['workflow_product', JSON.stringify(initialPageParam)],
    [initialPageParam],
  );

  const fetchProductList = async (params: GetProductListRequest) => {
    const resp = await ProductApi.PublicGetProductList(params);

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
    enabled,
    queryKey,
    queryFn: ({ pageParam }) => fetchProductList(pageParam),
    initialPageParam,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (!lastPage?.has_more) {
        return null;
      }
      return {
        ...lastPageParam,
        page_num: (lastPageParam.page_num ?? 1) + 1,
      };
    },
  });

  const workflowProductList = useMemo(() => {
    const result: ProductInfo[] = [];
    const idMap: Record<string, boolean> = {};
    pageData?.pages.forEach(page => {
      page?.products?.forEach(product => {
        if (!product.meta_info.id) {
          return;
        }

        if (!idMap[product.meta_info.id]) {
          result.push(product);
        }
        idMap[product.meta_info.id] = true;
      });
    });
    return result;
  }, [pageData]);

  const copyProduct = async (item: ProductInfo, targetSpaceId: string) => {
    if (!item?.meta_info?.id) {
      throw new CustomError('normal_error', 'no productId');
    }
    const res = await ProductApi.PublicDuplicateProduct(
      {
        product_id: item?.meta_info?.id,
        space_id: targetSpaceId,
        entity_type: item.meta_info.entity_type as ProductEntityType,
      },
      {
        __disableErrorToast: true,
      },
    );

    const workflowId = res.data?.new_entity_id;
    const pluginId = res.data?.new_plugin_id;

    if (!workflowId || !pluginId) {
      throw new CustomError(
        'normal_error',
        'copyProduct fail, no new_entity_id',
      );
    }
    sendTeaEvent(EVENT_NAMES.template_action_front, {
      template_id: item.meta_info.id ?? '',
      template_name: item.meta_info.name ?? '',
      template_type:
        item.meta_info.entity_type === ProductEntityType.WorkflowTemplateV2
          ? 'workflow'
          : 'imageflow',
      template_tag_professional: item.meta_info.is_professional
        ? 'professional'
        : 'basic',
      entity_id: item.meta_info.entity_id ?? '',
      ...(item?.meta_info?.is_free
        ? ({
            template_tag_prize: 'free',
          } as const)
        : ({
            template_tag_prize: 'paid',
            template_prize_detail: Number(item?.meta_info?.price?.amount) || 0,
          } as const)),
      action: 'duplicate',
      after_id: workflowId,
    });
    return { workflowId, pluginId };
  };
  return {
    // filter criteria
    updatePageParam,

    //
    workflowProductList,
    queryError,
    loadingStatus,
    refetch,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    hasNextPage,

    // operation
    copyProduct,
  } as const;
}
