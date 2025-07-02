/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum PublishResult {
  /** 未发布 */
  Default = 0,
  /** 审核中 */
  Auditing = 1,
  /** 发布成功 */
  Successful = 2,
  /** 发布失败 */
  Failed = 3,
}

export enum PublishStatus {
  /** 打包中 */
  Packing = 0,
  /** 打包失败 */
  PackFailed = 1,
  /** 审核中 */
  Auditing = 2,
  /** 审核未通过 */
  AuditNotPass = 3,
  /** 渠道发布中 */
  ConnectorPublishing = 4,
  /** 发布完成 */
  PublishDone = 5,
}
/* eslint-enable */
