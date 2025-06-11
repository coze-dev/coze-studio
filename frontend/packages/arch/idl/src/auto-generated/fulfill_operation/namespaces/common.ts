/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum AuditStatus {
  /** 默认 */
  Default = 0,
  /** 审核中 */
  Pending = 1,
  /** 审核通过 */
  Approved = 2,
  /** 审核不通过 */
  Rejected = 3,
  /** 已废弃 */
  Abandoned = 4,
}

export enum AuditType {
  ProductDraft = 10,
  Conversation = 20,
}

export enum AuditVisibility {
  Invisible = 10,
  Self = 15,
  AllWithoutRecommend = 20,
  All = 25,
}

export enum EntityType {
  Bot = 1,
  Plugin = 2,
  CozeToken = 50,
  Common = 99,
}
/* eslint-enable */
