import { type LocalStorageCacheConfig } from './types';

// 统一维护 key 定义避免出现冲突
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
