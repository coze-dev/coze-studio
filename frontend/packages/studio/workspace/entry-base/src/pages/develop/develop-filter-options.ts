import { SearchScope } from '@coze-arch/idl/intelligence_api';

import {
  DevelopCustomPublishStatus,
  DevelopCustomTypeStatus,
  type FilterParamsType,
} from './type';
export const CREATOR_FILTER_OPTIONS = [
  {
    value: SearchScope.All,
    labelI18NKey: 'bot_list_team',
  },
  {
    value: SearchScope.CreateByMe,
    labelI18NKey: 'bot_list_mine',
  },
] as const;

export const STATUS_FILTER_OPTIONS = [
  {
    value: DevelopCustomPublishStatus.All,
    labelI18NKey: 'filter_all',
  },
  {
    value: DevelopCustomPublishStatus.Publish,
    labelI18NKey: 'Published_1',
  },
  {
    value: 'recentOpened',
    labelI18NKey: 'filter_develop_recent_opened',
  },
] as const;

export const TYPE_FILTER_OPTIONS = [
  {
    value: DevelopCustomTypeStatus.All,
    labelI18NKey: 'filter_develop_all_types',
  },
  {
    value: DevelopCustomTypeStatus.Project,
    labelI18NKey: 'filter_develop_project',
  },
  {
    value: DevelopCustomTypeStatus.Agent,
    labelI18NKey: 'filter_develop_agent',
  },
] as const;

export const FILTER_PARAMS_DEFAULT: FilterParamsType = {
  searchScope: SearchScope.All,
  searchValue: '',
  isPublish: DevelopCustomPublishStatus.All,
  searchType: DevelopCustomTypeStatus.All,
  recentlyOpen: undefined,
};
