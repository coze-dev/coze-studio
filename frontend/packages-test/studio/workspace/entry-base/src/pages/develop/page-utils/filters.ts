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
