import * as base from './../base';
export { base };
export interface Price {
  /** amount */
  amount: string,
  /** Currencies such as USD and CNY */
  currency: string,
  /** decimal places */
  decimal_num: number,
}
export enum FollowType {
  /** Unknown */
  Unknown = 0,
  /** followee */
  Followee = 1,
  /** follower */
  Follower = 2,
  /** MutualFollow */
  MutualFollow = 3,
}