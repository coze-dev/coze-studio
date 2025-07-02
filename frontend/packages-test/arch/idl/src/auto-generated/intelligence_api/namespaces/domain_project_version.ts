/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ProjectVersionAuditStatus {
  /** 未审核/审核中 */
  Default = 0,
  /** 审核通过 */
  AuditPass = 1,
  /** 审核不通过 */
  AuditNotPass = 2,
}

export enum ProjectVersionStatus {
  /** 版本创建中 */
  Default = 0,
  /** 版本可用（创建成功） */
  Available = 1,
  /** 版本不可用（创建失败） */
  Unavailable = 2,
}

export enum ProjectVersionType {
  /** 发布 */
  Publish = 0,
  /** 存档 */
  Archive = 1,
}
/* eslint-enable */
