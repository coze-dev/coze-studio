/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** DEFAULT是默认状态，若ReviewResult.Result=CheckType.DEFAULT可以跳过，
 表示业务方未传入该字段
 copy from:  */
export enum CheckType {
  DEFAULT = 0,
  PASS = 1,
  REVIEW = 2,
  UNPASS = 3,
  /** 慢审机器不通过，目前只有在抖音用户资料使用 */
  ROBOT_UP = 4,
  /** 回滚 */
  ROLLBACK = 5,
  /** 重置 */
  RESET = 6,
}

export enum PassportAuditStatus {
  Reviewing = 1,
  /** 审核通过 */
  Approved = 2,
  /** 审核不通过 */
  Rejected = 3,
}

export interface AuditDetail {
  user_unique_name?: AuditInfo;
  nickname?: AuditInfo;
  avatar?: AuditInfo;
  signature?: AuditInfo;
}

export interface AuditInfo {
  result?: CheckType;
}

export interface UserInfo {
  UserID?: Int64;
  UserUniqueName?: string;
  Nickname?: string;
  Avatar?: string;
  Signature?: string;
  UserLabel?: UserLabel;
}

export interface UserLabel {
  label_id?: string;
  label_name?: string;
  icon_uri?: string;
  icon_url?: string;
  jump_link?: string;
}
/* eslint-enable */
