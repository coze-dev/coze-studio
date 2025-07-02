/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** *  domain 通用结构体 不属于任何聚合的通用结构体放在这里
 *  draft project  和  bot 的通用状态 */
export enum EntityStatus {
  Deleted = 0,
  Using = 1,
  Banned = 2,
  MoveFailed = 3,
  /** 复制中 或 复制失败 */
  Copying = 4,
}
/* eslint-enable */
