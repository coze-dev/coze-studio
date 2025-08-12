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
    /** When the filter conditions change, take the appropriate key and store it locally */
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
    /** Asynchronously reads filters from local storage */
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
      // Tea event tracking
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
