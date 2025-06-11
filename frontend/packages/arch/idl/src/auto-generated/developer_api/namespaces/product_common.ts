/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ProductDraftStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export enum ProductEntityType {
  Bot = 1,
  Plugin = 2,
  CozeToken = 50,
  Common = 99,
}

export enum ProductStatus {
  Listed = 1,
  Unlisted = 2,
}

export enum ProductUnlistType {
  ByAdmin = 1,
  ByUser = 2,
}

export enum SortType {
  Heat = 1,
  Newest = 2,
}

export enum VerifyStatus {
  /** 未认证 */
  Pending = 1,
  /** 认证成功 */
  Succeed = 2,
  /** 认证失败 */
  Failed = 3,
  /** 认证中 */
  InProgress = 4,
}
/* eslint-enable */
