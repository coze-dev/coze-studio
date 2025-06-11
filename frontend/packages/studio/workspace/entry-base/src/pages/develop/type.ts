import {
  type IntelligenceData,
  type SearchScope,
} from '@coze-arch/idl/intelligence_api';

export enum DevelopCustomPublishStatus {
  All = 0,
  Publish = 1,
  NoPublish = 2,
}

export enum DevelopCustomTypeStatus {
  All = 0,
  Project = 1,
  Agent = 2,
  DouyinAvatarBot = 3, // single agent 类型的抖音分身 社区版暂不支持该功能
}

export interface DraftIntelligenceList {
  list: IntelligenceData[];
  hasMore: boolean;
  nextCursorId: string | undefined;
}

export interface FilterParamsType {
  searchScope: SearchScope | undefined;
  searchValue: string;
  isPublish: DevelopCustomPublishStatus;
  searchType: DevelopCustomTypeStatus;
  recentlyOpen: boolean | undefined;
}
