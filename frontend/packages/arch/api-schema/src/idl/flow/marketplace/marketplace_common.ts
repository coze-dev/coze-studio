import * as base from './../../base';
export { base };
export interface Price {
  /** 金额 */
  amount: string,
  /** 币种，如USD、CNY */
  currency: string,
  /** 小数位数 */
  decimal_num: number,
}
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