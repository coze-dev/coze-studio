/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum AuditStatus {
  /** 审核中 */
  Auditing = 0,
  /** 审核通过 */
  Success = 1,
  /** 审核失败 */
  Failed = 2,
}

export enum DomainAuditStatus {
  /** 审核通过 */
  Success = 1,
  /** 审核失败 */
  Failed = 2,
}
/* eslint-enable */
