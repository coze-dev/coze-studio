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
 
import { useEffect, useState } from 'react';

import { parse } from 'qs';
import { useUpdateEffect } from 'ahooks';
import { localStorageService } from '@coze-foundation/local-storage';
import { ResType } from '@coze-arch/idl/plugin_develop';
import { safeJSONParse } from '@coze-agent-ide/space-bot/util';

import { compareObjects } from '@/utils';

import { initialParam, type QueryParams } from '../consts';

/**
 * 从url query中获取搜索参数 优先级最高，高于LS缓存
 * @returns {} | undefined
 */
const getSearchParamsFromUrl = () => {
  const urlQuery = parse(location.search.slice(1)) as {
    type?: string;
    name?: string;
  };
  const searchParams: QueryParams = {};
  if (urlQuery.type && Object.values(ResType).includes(Number(urlQuery.type))) {
    const resType = Number(urlQuery.type);
    searchParams.res_type_filter =
      resType === ResType.Knowledge ? [resType, -1] : [resType];
  }
  if (urlQuery.name) {
    searchParams.name = urlQuery.name;
  }
  return searchParams;
};

// 异步初始化获取筛选参数, 分别从LS缓存获取和url query获取
const getDefaultFilterParams = async () => {
  const searchParamsFromUrl = getSearchParamsFromUrl();
  const localFilterParams = await localStorageService.getValueSync(
    'workspace-library-filters',
  );
  let defaultFilterParams = initialParam;

  if (localFilterParams) {
    const safeParams = safeJSONParse(localFilterParams) as QueryParams;
    defaultFilterParams = { ...defaultFilterParams, ...safeParams };
  }

  // 图像流和工作流合并会删除资源中的图像流选项 这里转换成全部
  if (defaultFilterParams?.res_type_filter?.[0] === 3) {
    defaultFilterParams.res_type_filter[0] = -1;
  }

  defaultFilterParams = { ...defaultFilterParams, ...searchParamsFromUrl };

  return defaultFilterParams;
};

export const useCachedQueryParams = ({ spaceId }: { spaceId: string }) => {
  const [ready, setReady] = useState(false);
  const [params, setParams] = useState<QueryParams>(initialParam);
  const hasFilter = !compareObjects(params, initialParam, [
    'res_type_filter',
    'user_filter',
    'publish_status_filter',
    'name',
  ]);

  /** 每次切换空间的时候，重新初始化筛选条件，并清空搜索框，重新请求资源列表 */
  useEffect(() => {
    setReady(false);
    getDefaultFilterParams().then(filters => {
      setParams(p => ({
        ...p,
        ...filters,
        cursor: '', // 筛选、刷新时重置为空
      }));
      setReady(true);
    });
  }, [spaceId]);

  useUpdateEffect(() => {
    /** 当筛选条件变化时，取合适的 key 存入本地 */
    const tempParams = {
      res_type_filter: params.res_type_filter,
      user_filter: params.user_filter,
      publish_status_filter: params.publish_status_filter,
    };
    localStorageService.setValue(
      'workspace-library-filters',
      JSON.stringify(tempParams),
    );
  }, [params]);

  const resetParams = () => {
    setParams(initialParam);
  };

  return {
    params,
    setParams,
    resetParams,
    hasFilter,
    ready,
  } as const;
};
