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
