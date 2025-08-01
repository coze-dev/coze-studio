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
