/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as user_common from './user_common';

export type Int64 = string | number;

export interface BuiAuditInfo {
  AuditStatus?: user_common.PassportAuditStatus;
  UnPassReason?: string;
  LastModifyTime?: Int64;
  /** map[string]AuditInfo 的序列化字段，下面的注释是具体的struct结构 */
  AuditInfoJson?: string;
}
/* eslint-enable */
