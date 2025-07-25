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
 
/**
 * @file 社区版暂时不提供企业管理功能，本文件中导出的方法用于未来拓展使用。
 */

export { PERSONAL_ENTERPRISE_ID } from './constants';
export { useEnterpriseStore } from './stores/enterprise';

export { useEnterpriseList } from './hooks/use-enterprise-list';
export { useCheckEnterpriseExist } from './hooks/use-check-enterprise-exist';
export {
  useCurrentEnterpriseInfo,
  useCurrentEnterpriseId,
  useIsCurrentPersonalEnterprise,
  useCurrentEnterpriseRoles,
  useIsEnterpriseLevel,
  useIsTeamLevel,
  useIsCurrentEnterpriseInit,
  CurrentEnterpriseInfoProps,
} from './hooks/use-current-enterprise-info';

// 工具方法
export { switchEnterprise } from './utils/switch-enterprise';
export { isPersonalEnterprise } from './utils/personal';
