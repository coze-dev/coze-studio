/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum FollowType {
  /** 无关系 */
  Unknown = 0,
  /** 关注 */
  Followee = 1,
  /** 粉丝 */
  Follower = 2,
  /** 互相关注 */
  MutualFollow = 3,
}

export enum UserRole {
  Unknown = 0,
  /** 普通版 */
  Normal = 1,
  /** 专业版主账号 */
  ProfessionalRootUser = 2,
  /** 专业版子账号 */
  ProfessionalBasicAccount = 3,
}

export interface Price {
  /** 金额 */
  amount?: string;
  /** 币种，如USD、CNY */
  currency?: string;
  /** 小数位数 */
  decimal_num?: number;
}
/* eslint-enable */
