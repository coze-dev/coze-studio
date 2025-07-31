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

import { type LocalStorageCacheConfig } from './types';

// Maintain key definitions uniformly to avoid conflicts
export const LOCAL_STORAGE_CACHE_KEYS = [
  'coachmark',
  'workspace-spaceId',
  'workspace-subMenu',
  'workspace-develop-filters',
  'workspace-library-filters',
  'workspace-ocean-project-filters',
  'coze-home-session-area-hidden-key',
  'template-purchase-agreement-checked',
  'coze-promptkit-recommend-pannel-hidden-key',
  'workflow-toolbar-role-onboarding-hidden',
  'coze-project-entity-hidden-key',
  'enterpriseId',
  'resourceCopyTaskIds',
  'coze-create-enterprise-success',
  'coze-show-product-matrix-tips',
] as const satisfies readonly string[];

export type LocalStorageCacheKey = (typeof LOCAL_STORAGE_CACHE_KEYS)[number];

export type LocalStorageCacheConfigMap = {
  [key in LocalStorageCacheKey]?: LocalStorageCacheConfig;
};

export const cacheConfig: LocalStorageCacheConfigMap = {
  coachmark: {
    bindAccount: true,
  },
  'workspace-spaceId': {
    bindAccount: true,
  },
  'workspace-subMenu': {
    bindAccount: true,
  },
  'template-purchase-agreement-checked': {
    bindAccount: true,
  },
  enterpriseId: {
    bindAccount: true,
  },
  resourceCopyTaskIds: {
    bindAccount: true,
  },
};
