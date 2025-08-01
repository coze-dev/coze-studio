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
 * Get search parameters from url query, highest priority, higher than LS cache
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

// Asynchronous initialization to obtain filter parameters, obtained from LS cache and url query respectively
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

  // Merging image flow and workflow removes the image flow option in the resource, here converted to all
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

  /** Each time you switch spaces, reinitialize the filter criteria, clear the search box, and rerequest the resource list */
  useEffect(() => {
    setReady(false);
    getDefaultFilterParams().then(filters => {
      setParams(p => ({
        ...p,
        ...filters,
        cursor: '', // Filter, reset to empty when refreshing
      }));
      setReady(true);
    });
  }, [spaceId]);

  useUpdateEffect(() => {
    /** When the filter conditions change, take the appropriate key and store it locally */
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
