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

import { exhaustiveCheckForRecord } from '@coze-common/chat-area-utils';
import { SearchScope } from '@coze-arch/idl/intelligence_api';

import { DevelopCustomTypeStatus, type FilterParamsType } from '../type';
import { FILTER_PARAMS_DEFAULT } from '../develop-filter-options';

export const isEqualDefaultFilterParams = ({
  filterParams,
}: {
  filterParams: FilterParamsType;
}) => {
  const {
    searchScope,
    searchValue,
    searchType,
    isPublish,
    recentlyOpen,
    ...rest
  } = filterParams;
  exhaustiveCheckForRecord(rest);
  return (
    searchScope === FILTER_PARAMS_DEFAULT.searchScope &&
    searchType === FILTER_PARAMS_DEFAULT.searchType &&
    isPublish === FILTER_PARAMS_DEFAULT.isPublish &&
    recentlyOpen === FILTER_PARAMS_DEFAULT.recentlyOpen &&
    !searchValue
  );
};

export const isFilterHighlight = (currentFilterParams: FilterParamsType) => {
  const {
    searchValue,
    searchScope,
    isPublish,
    searchType,
    recentlyOpen,
    ...rest
  } = currentFilterParams;
  exhaustiveCheckForRecord(rest);
  return {
    isIntelligenceTypeFilterHighlight:
      searchType !== DevelopCustomTypeStatus.All,
    isOwnerFilterHighlight: searchScope !== SearchScope.All,
    isPublishAndOpenFilterHighlight: isPublish || recentlyOpen,
  };
};
