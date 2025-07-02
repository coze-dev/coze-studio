/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** 计数相关 */
export enum CountOpType {
  /** count key 存在就会将原有的值加上新值 */
  Incr = 1,
  /** count key 不存在就会设置新值, 存在也会被替换为新值 */
  Set = 2,
}
/* eslint-enable */
