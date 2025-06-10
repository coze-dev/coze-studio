/**
 * @file 社区版暂时不提供企业管理功能，本文件中导出的方法用于未来拓展使用。
 */

import { PERSONAL_ENTERPRISE_ID } from '../constants';

// 检查企业是否为个人版
export const isPersonalEnterprise = (enterpriseId?: string) =>
  enterpriseId === PERSONAL_ENTERPRISE_ID;
