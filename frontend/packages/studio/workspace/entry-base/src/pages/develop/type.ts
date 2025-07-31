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
  DouyinAvatarBot = 3, // Single agent type Douyin doppelganger
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
