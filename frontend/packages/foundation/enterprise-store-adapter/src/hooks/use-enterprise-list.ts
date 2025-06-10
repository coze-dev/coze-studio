/**
 * @file 社区版暂时不提供企业管理功能，本文件中导出的方法用于未来拓展使用。
 */

import { useEnterpriseStore } from '../stores/enterprise';
/**
 * 获取企业列表的hook。
 * 从企业store中获取企业列表，并返回企业信息列表。
 * @returns {Array} 企业信息列表
 */
export const useEnterpriseList = () => {
  const list = useEnterpriseStore(store => store.enterpriseList);

  return list?.enterprise_info_list ?? [];
};
