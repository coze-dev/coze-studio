import { useEffect, useState } from 'react';

import { isObject, merge } from 'lodash-es';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import { safeJSONParse } from '@coze-agent-ide/space-bot/util';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { localStorageService } from '@coze-foundation/local-storage';

import { type FilterParamsType } from '../type';
import { FILTER_PARAMS_DEFAULT } from '../develop-filter-options';

const isPersistentFilterParamsType = (
  params: unknown,
): params is Partial<FilterParamsType> => isObject(params);

const getDefaultFilterParams = async () => {
  const localFilterParams = await localStorageService.getValueSync(
    'workspace-develop-filters',
  );
  if (!localFilterParams) {
    return FILTER_PARAMS_DEFAULT;
  }
  const parsedFilterParams = safeJSONParse(localFilterParams) as unknown;
  if (isPersistentFilterParamsType(parsedFilterParams)) {
    return merge({}, FILTER_PARAMS_DEFAULT, parsedFilterParams);
  }
  return FILTER_PARAMS_DEFAULT;
};

export const useCachedQueryParams = () => {
  const [filterParams, setFilterParams] = useState<FilterParamsType>(
    FILTER_PARAMS_DEFAULT,
  );

  useUpdateEffect(() => {
    /** 当筛选条件变化时，取合适的 key 存入本地 */
    const { searchScope, isPublish, recentlyOpen, searchType } = filterParams;
    localStorageService.setValue(
      'workspace-develop-filters',
      JSON.stringify({
        searchScope,
        isPublish,
        searchType,
        recentlyOpen,
      }),
    );
  }, [filterParams]);

  useEffect(() => {
    /** 异步读取本地存储的筛选条件 */
    getDefaultFilterParams().then(filters => {
      setFilterParams(prev => merge({}, prev, filters));
    });
  }, []);

  const debouncedSetSearchValue = useDebounceFn(
    (searchValue = '') => {
      setFilterParams(params => ({
        ...params,
        searchValue,
      }));
      // tea 埋点
      sendTeaEvent(EVENT_NAMES.search_front, {
        full_url: location.href,
        source: 'develop',
        search_word: searchValue,
      });
    },
    {
      wait: 300,
    },
  );

  return [filterParams, setFilterParams, debouncedSetSearchValue.run] as const;
};
