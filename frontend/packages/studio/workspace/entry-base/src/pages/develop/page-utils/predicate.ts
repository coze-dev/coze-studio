import { SearchScope } from '@coze-arch/idl/intelligence_api';

import { DevelopCustomPublishStatus } from '../type';

export function isPublishStatus(
  val: unknown,
): val is DevelopCustomPublishStatus {
  const statusList: unknown[] = [
    DevelopCustomPublishStatus.All,
    DevelopCustomPublishStatus.NoPublish,
    DevelopCustomPublishStatus.Publish,
  ];

  return statusList.includes(val);
}

export const isSearchScopeEnum = (val: unknown): val is SearchScope =>
  val === SearchScope.All || val === SearchScope.CreateByMe;
